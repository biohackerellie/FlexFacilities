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
		holidays, err := c.USHolidayDates(ctx, plan.Series.Start, plan.Series.End)
		if err != nil {
			return nil, err
		}
		exdates = append(exdates, holidays...)
		ev := &gcal.Event{
			Summary:     firstNonEmpty(opts.Summary, plan.Series.Summary),
			Description: firstNonEmpty(opts.Description, plan.Series.Description),
			Location:    firstNonEmpty(opts.Location, plan.Series.Location),
			Start: &gcal.EventDateTime{
				DateTime: plan.Series.Start.In(c.loc).Format(time.RFC3339),
				TimeZone: c.tz,
			},
			End: &gcal.EventDateTime{
				DateTime: plan.Series.End.In(c.loc).Format(time.RFC3339),
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
					DateTime: oc.Start.In(c.loc).Format(time.RFC3339),
					TimeZone: c.tz,
				},
				End: &gcal.EventDateTime{
					DateTime: oc.End.In(c.loc).Format(time.RFC3339),
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
		if hasPrefixCaseInsensitive(rrule, "RRULE:") {
			rec = append(rec, rrule)
		} else {
			rec = append(rec, "RRULE:"+rrule)
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
