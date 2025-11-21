package workers

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"api/internal/ports"
	"api/pkg/calendar"
	gcal "google.golang.org/api/calendar/v3"
)

type CalendarSync struct {
	FacilityStore ports.FacilityStore
	Calendar      *calendar.Calendar
	Interval      time.Duration
	Logger        *slog.Logger
}

func (cs *CalendarSync) Name() string { return "CalendarSync" }

func (cs *CalendarSync) Run(ctx context.Context) {
	// Handle zero or negative intervals by using a reasonable minimum
	interval := cs.Interval
	if interval <= 0 {
		interval = time.Hour // Default to 1 hour
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			cs.Logger.Info("Exiting", "name", cs.Name())
			return
		case <-ticker.C:
			cs.Logger.Info("Starting calendar sync")
			if err := cs.syncCalendars(ctx); err != nil {
				cs.Logger.Error("Calendar sync failed", "error", err)
			} else {
				cs.Logger.Info("Calendar sync completed successfully")
			}
		}
	}
}

func (cs *CalendarSync) syncCalendars(ctx context.Context) error {
	// Get all buildings
	buildings, err := cs.FacilityStore.GetAllBuildings(ctx)
	if err != nil {
		return fmt.Errorf("failed to get buildings: %w", err)
	}

	cs.Logger.Info("Syncing calendars", "building_count", len(buildings))

	// Process buildings sequentially to reduce API load
	// The Calendar package handles rate limiting internally
	errorCount := 0
	for _, building := range buildings {
		// Skip buildings without a calendar ID
		if !building.GoogleCalendarID.Valid {
			cs.Logger.Debug("Skipping building without calendar ID", "building_id", building.ID, "building_name", building.Name)
			continue
		}

		if err := cs.syncBuildingCalendar(ctx, building.ID, building.Name, building.GoogleCalendarID.String); err != nil {
			cs.Logger.Error("Failed to sync building calendar",
				"building_id", building.ID,
				"building_name", building.Name,
				"error", err,
			)
			errorCount++
		} else {
			cs.Logger.Info("Successfully synced building calendar",
				"building_id", building.ID,
				"building_name", building.Name,
			)
		}

		// Check for context cancellation between buildings
		select {
		case <-ctx.Done():
			return fmt.Errorf("sync cancelled after %d errors: %w", errorCount, ctx.Err())
		default:
		}
	}

	if errorCount > 0 {
		return fmt.Errorf("sync completed with %d building errors", errorCount)
	}

	return nil
}

func (cs *CalendarSync) syncBuildingCalendar(ctx context.Context, buildingID int64, buildingName string, buildingCalendarID string) error {
	// Get all facilities for this building
	buildingWithFacilities, err := cs.FacilityStore.GetByBuilding(ctx, buildingID)
	if err != nil {
		return fmt.Errorf("failed to get facilities for building %d: %w", buildingID, err)
	}

	// Clear existing events from building calendar
	if err := cs.clearBuildingCalendar(ctx, buildingCalendarID); err != nil {
		return fmt.Errorf("failed to clear building calendar: %w", err)
	}

	cs.Logger.Debug("Cleared building calendar", "building_id", buildingID, "facility_count", len(buildingWithFacilities.Facilities))

	// Collect events from all facility calendars concurrently
	type facilityEvents struct {
		facilityName string
		events       []*gcal.Event
		err          error
	}

	eventsChan := make(chan facilityEvents, len(buildingWithFacilities.Facilities))
	var wg sync.WaitGroup

	for _, facility := range buildingWithFacilities.Facilities {
		// Skip facilities without a calendar ID
		if facility.GoogleCalendarID == "" {
			cs.Logger.Debug("Skipping facility without calendar ID",
				"facility_id", facility.ID,
				"facility_name", facility.Name,
			)
			continue
		}

		wg.Add(1)
		go func(facilityID int64, facilityName string, calendarID string) {
			defer wg.Done()

			events, err := cs.Calendar.ListEventsWithContext(ctx, calendarID)
			if err != nil {
				cs.Logger.Error("Failed to list events for facility",
					"facility_id", facilityID,
					"facility_name", facilityName,
					"error", err,
				)
				eventsChan <- facilityEvents{facilityName: facilityName, err: err}
				return
			}

			// Modify event summaries to include facility name
			var facilityEvts []*gcal.Event
			if events != nil && events.Items != nil {
				for _, event := range events.Items {
					// Create a copy of the event with modified summary
					modifiedEvent := &gcal.Event{
						Summary:     fmt.Sprintf("%s [%s]", event.Summary, facilityName),
						Description: event.Description,
						Location:    event.Location,
						Start:       event.Start,
						End:         event.End,
					}
					facilityEvts = append(facilityEvts, modifiedEvent)
				}
			}

			eventsChan <- facilityEvents{facilityName: facilityName, events: facilityEvts}
		}(facility.ID, facility.Name, facility.GoogleCalendarID)
	}

	// Close channel when all goroutines complete
	go func() {
		wg.Wait()
		close(eventsChan)
	}()

	// Collect all events
	var allEvents []*gcal.Event
	for fe := range eventsChan {
		if fe.err != nil {
			// Log error but continue processing other facilities
			continue
		}
		allEvents = append(allEvents, fe.events...)
	}

	cs.Logger.Debug("Collected events from facilities",
		"building_id", buildingID,
		"event_count", len(allEvents),
	)

	// Add all events to building calendar
	errorCount := 0
	for _, event := range allEvents {
		if _, err := cs.Calendar.InsertEventWithContext(ctx, buildingCalendarID, event); err != nil {
			cs.Logger.Error("Failed to insert event into building calendar",
				"building_id", buildingID,
				"event_summary", event.Summary,
				"error", err,
			)
			errorCount++
		}
	}

	if errorCount > 0 {
		return fmt.Errorf("failed to insert %d events", errorCount)
	}

	return nil
}

func (cs *CalendarSync) clearBuildingCalendar(ctx context.Context, calendarID string) error {
	// List all events in the building calendar
	events, err := cs.Calendar.ListEventsWithContext(ctx, calendarID)
	if err != nil {
		return fmt.Errorf("failed to list events: %w", err)
	}

	if events == nil || events.Items == nil {
		return nil
	}

	// Delete all events
	for _, event := range events.Items {
		if err := cs.Calendar.DeleteEventWithContext(ctx, calendarID, event.Id); err != nil {
			cs.Logger.Warn("Failed to delete event from building calendar",
				"calendar_id", calendarID,
				"event_id", event.Id,
				"error", err,
			)
			// Continue even if one delete fails
		}
	}

	return nil
}
