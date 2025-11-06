package calendar

import (
	"context"
	"fmt"
	"sort"
	"strings"
	"time"

	gcal "google.golang.org/api/calendar/v3"
)

type Mode string

const (
	ModeSeries  Mode = "series"
	ModeSingles Mode = "singles"
)

func (m Mode) String() string {
	return string(m)
}

type PublishPlan struct {
	Mode
	Series  *SeriesSpec
	Singles []OccSpec
}

type SeriesSpec struct {
	Start       time.Time
	End         time.Time
	RRULE       string
	EXDATEs     []time.Time
	Summary     string
	Description string
	Location    string
}

type OccSpec struct {
	Start       time.Time
	End         time.Time
	RefID       int64
	Summary     string
	Description string
	Location    string
}

type SendUpdates string

const (
	AllUpdates      SendUpdates = "all"
	ExternalUpdates SendUpdates = "externalOnly"
	NoUpdates       SendUpdates = "none"
)

func (s SendUpdates) String() string {
	return string(s)
}

type PublishOptions struct {
	CalendarID  string
	Summary     string // default summary if not provided per-spec
	Description string // default description
	Location    string // default location
	SendUpdates SendUpdates
}

type PublishResult struct {
	MasterEventID *string
	SingleEventID map[int64]string
	EventIDs      []string
}

func (c *Calendar) Publish(ctx context.Context, plan *PublishPlan, opts PublishOptions) (*PublishResult, error) {
	if plan == nil {
		return nil, fmt.Errorf("publish plan is nil")
	}
	if opts.CalendarID == "" {
		return nil, fmt.Errorf("calendarID is required")
	}
	send := opts.SendUpdates.String()
	if send == "" {
		send = "none"
	}
	var exdates []time.Time
	switch plan.Mode {
	case ModeSeries:
		if plan.Series == nil {
			return nil, fmt.Errorf("missing series spec")
		}
		exdates = plan.Series.EXDATEs
		// firstDay := exdates[0]
		// lastDay := exdates[len(exdates)-1]
		// holidays, err := c.USHolidayDates(ctx, firstDay, lastDay)
		// if err != nil {
		// 	return nil, err
		// }
		// exdates = append(exdates, holidays...)
		fmt.Println("Start: ", plan.Series.Start.In(&c.loc).Format(time.RFC3339))
		ev := &gcal.Event{
			Summary:     firstNonEmpty(opts.Summary, plan.Series.Summary),
			Description: firstNonEmpty(opts.Description, plan.Series.Description),
			Location:    firstNonEmpty(opts.Location, plan.Series.Location),
			Start: &gcal.EventDateTime{
				DateTime: plan.Series.Start.Format("2006-01-02T15:04:05"),
				TimeZone: c.tz,
			},
			End: &gcal.EventDateTime{
				DateTime: plan.Series.End.Format("2006-01-02T15:04:05"),
				TimeZone: c.tz,
			},
			Recurrence: buildRecurrence(c.tz, plan.Series.RRULE, exdates),
		}

		call := c.svc.Events.Insert(opts.CalendarID, ev).SendUpdates(send)
		created, err := call.Context(ctx).Do()
		if err != nil {
			return nil, err
		}
		return &PublishResult{
			MasterEventID: &created.Id,
		}, nil

	case ModeSingles:
		if len(plan.Singles) == 0 {
			return &PublishResult{SingleEventID: map[int64]string{}}, nil
		}
		result := &PublishResult{
			SingleEventID: make(map[int64]string, len(plan.Singles)),
			EventIDs:      make([]string, 0, len(plan.Singles)),
		}
		for i, oc := range plan.Singles {
			ev := &gcal.Event{
				Summary:     firstNonEmpty(oc.Summary, opts.Summary),
				Description: firstNonEmpty(oc.Description, opts.Description),
				Location:    firstNonEmpty(oc.Location, opts.Location),
				Start: &gcal.EventDateTime{
					DateTime: oc.Start.Format("2006-01-02T15:04:05"),
					TimeZone: c.tz,
				},
				End: &gcal.EventDateTime{
					DateTime: oc.End.Format("2006-01-02T15:04:05"),
					TimeZone: c.tz,
				},
			}
			call := c.svc.Events.Insert(opts.CalendarID, ev).SendUpdates(send)
			created, err := call.Context(ctx).Do()
			if err != nil {
				return result, fmt.Errorf("failed to create event: %d: %w", i, err)
			}
			result.EventIDs = append(result.EventIDs, created.Id)
			if oc.RefID != 0 {
				result.SingleEventID[oc.RefID] = created.Id
			}
		}
		return result, nil

	default:
		return nil, fmt.Errorf("unknown mode: %s", plan.Mode)
	}
}

func buildRecurrence(tz, rrule string, exdates []time.Time) []string {
	rec := []string{}
	if rrule != "" {
		clean := normalizeRRule(rrule)
		if hasPrefixCaseInsensitive(clean, "RRULE:") {
			rec = append(rec, clean)
		} else {
			rec = append(rec, "RRULE:"+clean)
		}
	}
	if len(exdates) > 0 {
		sort.Slice(exdates, func(i, j int) bool { return exdates[i].Before(exdates[j]) })
		rec = append(rec, exdateLine(tz, exdates))
	}
	return rec
}

func exdateLine(tz string, starts []time.Time) string {
	parts := make([]string, 0, len(starts))
	for _, s := range starts {
		parts = append(parts, s.Format("20060102T150405"))
	}
	return fmt.Sprintf("EXDATE;TZID=%s:%s", tz, strings.Join(parts, ","))
}
func hasPrefixCaseInsensitive(s, prefix string) bool {
	if len(s) < len(prefix) {
		return false
	}
	return strings.EqualFold(s[:len(prefix)], prefix)
}
func firstNonEmpty(xs ...string) string {
	for _, x := range xs {
		if x != "" {
			return x
		}
	}
	return ""
}
func normalizeRRule(rr string) string {
	lines := strings.Split(rr, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(strings.ToUpper(line), "RRULE:") {
			return line // only keep the RRULE part
		}
	}
	return rr // fallback: return as-is
}
func (c *Calendar) AddExdatesToMaster(ctx context.Context, calendarID, masterEventID, rrule string, exdates []time.Time) error {
	rec := buildRecurrence(c.tz, rrule, exdates)
	patch := &gcal.Event{Recurrence: rec}
	_, err := c.svc.Events.Patch(calendarID, masterEventID, patch).
		SendUpdates("none").
		Context(ctx).
		Do()
	return err
}
func (c *Calendar) AddRdatesToMaster(ctx context.Context, calendarID, masterEventID, rrule string, exdates, rdates []time.Time) error {
	rec := buildRecurrenceWithRdates(c.tz, rrule, exdates, rdates, &c.loc)
	patch := &gcal.Event{Recurrence: rec}
	_, err := c.svc.Events.Patch(calendarID, masterEventID, patch).
		SendUpdates("none").
		Context(ctx).
		Do()
	return err
}

func buildRecurrenceWithRdates(tz, rrule string, exdates, rdates []time.Time, loc *time.Location) []string {
	var out []string
	// Ensure RRULE: prefix
	if rrule != "" {
		if strings.HasPrefix(strings.ToUpper(rrule), "RRULE:") {
			out = append(out, rrule)
		} else {
			out = append(out, "RRULE:"+rrule)
		}
	}

	// EXDATE
	if len(exdates) > 0 {
		sort.Slice(exdates, func(i, j int) bool { return exdates[i].Before(exdates[j]) })
		parts := make([]string, 0, len(exdates))
		for _, t := range exdates {
			parts = append(parts, t.In(loc).Format("20060102T150405"))
		}
		out = append(out, fmt.Sprintf("EXDATE;TZID=%s:%s", tz, strings.Join(parts, ",")))
	}

	// RDATE
	if len(rdates) > 0 {
		sort.Slice(rdates, func(i, j int) bool { return rdates[i].Before(rdates[j]) })
		parts := make([]string, 0, len(rdates))
		for _, t := range rdates {
			parts = append(parts, t.In(loc).Format("20060102T150405"))
		}
		out = append(out, fmt.Sprintf("RDATE;TZID=%s:%s", tz, strings.Join(parts, ",")))
	}

	return out
}

type RDateSpec struct {
	Start       time.Time // local wall start for the added occurrence
	End         time.Time // local wall end (if End-Start != master duration, we’ll override)
	Summary     string    // optional per-instance override
	Description string    // optional
	Location    string    // optional
}

// Adds RDATEs to the master event and patches instance times for those whose duration differs from master.
// rrule is the master’s RRULE (without or with "RRULE:" prefix — we’ll handle both).
func (c *Calendar) AddRdatesWithOverrides(ctx context.Context, calendarID, masterEventID, rrule string, exdates []time.Time, adds []RDateSpec) error {
	if len(adds) == 0 {
		return nil
	}

	// 1) Patch master: RRULE + existing EXDATE + RDATE (starts only)
	rdateStarts := make([]time.Time, len(adds))
	for i := range adds {
		rdateStarts[i] = adds[i].Start
	}
	rec := buildRecurrenceWithRdates(c.tz, rrule, exdates, rdateStarts, &c.loc)

	_, err := c.svc.Events.Patch(calendarID, masterEventID, &gcal.Event{
		Recurrence: rec,
	}).SendUpdates("none").Context(ctx).Do()
	if err != nil {
		return fmt.Errorf("patch master with RDATEs: %w", err)
	}

	// 2) Determine master duration from the event (optional but helpful to decide which need overrides)
	master, err := c.svc.Events.Get(calendarID, masterEventID).Context(ctx).Do()
	if err != nil {
		return fmt.Errorf("get master after patch: %w", err)
	}
	masterStart, _ := time.Parse(time.RFC3339, master.Start.DateTime)
	masterEnd, _ := time.Parse(time.RFC3339, master.End.DateTime)
	masterDur := masterEnd.Sub(masterStart)

	// 3) For any added date where End-Start != master duration, patch that instance only
	for _, spec := range adds {
		if spec.End.Sub(spec.Start) == masterDur {
			continue // same duration as master; no override needed
		}
		if err := c.patchInstance(ctx, calendarID, masterEventID, spec); err != nil {
			return err
		}
	}
	return nil
}

// Patch one instance (override). Only that occurrence is changed.
func (c *Calendar) patchInstance(ctx context.Context, calendarID, masterEventID string, spec RDateSpec) error {
	// Find the instance by original start (Instances API). Give a window for safety.
	tMin := spec.Start.Add(-2 * time.Hour).In(&c.loc).Format(time.RFC3339)
	tMax := spec.Start.Add(2 * time.Hour).In(&c.loc).Format(time.RFC3339)
	orig := spec.Start.In(&c.loc).Format(time.RFC3339)

	inst, err := c.svc.Events.Instances(calendarID, masterEventID).
		TimeMin(tMin).
		TimeMax(tMax).
		ShowDeleted(false).
		Context(ctx).
		Do()
	if err != nil {
		return fmt.Errorf("instances lookup: %w", err)
	}

	var target *gcal.Event
	for _, it := range inst.Items {
		if it.OriginalStartTime != nil && it.OriginalStartTime.DateTime == orig {
			target = it
			break
		}
	}
	if target == nil {
		// Small propagation delay can happen right after adding RDATE; retry once after a short sleep if desired.
		return fmt.Errorf("instance not found at %s", orig)
	}

	patch := &gcal.Event{
		Start: &gcal.EventDateTime{
			DateTime: spec.Start.In(&c.loc).Format(time.RFC3339),
			TimeZone: c.tz,
		},
		End: &gcal.EventDateTime{
			DateTime: spec.End.In(&c.loc).Format(time.RFC3339),
			TimeZone: c.tz,
		},
	}
	// Optional per-instance text/location overrides
	if spec.Summary != "" || spec.Description != "" || spec.Location != "" {
		if spec.Summary != "" {
			patch.Summary = spec.Summary
		}
		if spec.Description != "" {
			patch.Description = spec.Description
		}
		if spec.Location != "" {
			patch.Location = spec.Location
		}
	}

	_, err = c.svc.Events.Patch(calendarID, target.Id, patch).
		SendUpdates("none").
		Context(ctx).
		Do()
	return err
}
