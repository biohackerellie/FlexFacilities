package recur

import (
	"fmt"
	"time"

	"github.com/teambition/rrule-go"
)

type RecurrencePattern struct {
	Freq      string   // "DAILY", "WEEKLY", "MONTHLY", "YEARLY" or "" for single event
	ByWeekday []string // ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
	Until     string   // "YYYY-MM-DD"
	Count     int
}

type Payload struct {
	StartDate string // "YYYY-MM-DD"
	EndDate   string // "YYYY-MM-DD"
	StartTime string // "HH:mm"
	EndTime   string // "HH:mm"
	Pattern   RecurrencePattern
	RDates    []string //iso "YYY-MM-DDTHH:mm"
	EXDates   []string
}

func toWeekday(w string) rrule.Weekday {
	switch w {
	case "MO":
		return rrule.MO
	case "TU":
		return rrule.TU
	case "WE":
		return rrule.WE
	case "TH":
		return rrule.TH
	case "FR":
		return rrule.FR
	case "SA":
		return rrule.SA
	case "SU":
		return rrule.SU
	}
	return rrule.MO
}

func toFreq(s string) (rrule.Frequency, error) {
	switch s {
	case "DAILY":
		return rrule.DAILY, nil
	case "WEEKLY":
		return rrule.WEEKLY, nil
	case "MONTHLY":
		return rrule.MONTHLY, nil
	case "YEARLY":
		return rrule.YEARLY, nil
	case "", "NONE":
		// Treat as single occurrence; caller can handle nil rule
		return -1, nil
	default:
		return -1, fmt.Errorf("unsupported freq: %q", s)
	}
}

// BuildRRule builds a recurrence rule based on local (facility) time.
// Returns (rule, dtstart, duration). If pattern indicates a single occurrence,
// rule will be nil and you can treat (dtstart, duration) as the only event.
//
// loc must be the facility's *time.Location.
// p.Pattern.Freq can be empty/"NONE" for single occurrence.
func BuildRRule(loc *time.Location, p Payload) (*rrule.RRule, time.Time, time.Duration, error) {
	if loc == nil {
		return nil, time.Time{}, 0, fmt.Errorf("nil location")
	}

	startDate, err := time.ParseInLocation("2006-01-02", p.StartDate, loc)
	if err != nil {
		return nil, time.Time{}, 0, fmt.Errorf("parse StartDate: %w", err)
	}
	st, err := time.ParseInLocation("15:04", p.StartTime, loc)
	if err != nil {
		return nil, time.Time{}, 0, fmt.Errorf("parse StartTime: %w", err)
	}
	et, err := time.ParseInLocation("15:04", p.EndTime, loc)
	if err != nil {
		return nil, time.Time{}, 0, fmt.Errorf("parse EndTime: %w", err)
	}

	// Determine the first occurrence date.
	first := startDate
	if len(p.Pattern.ByWeekday) > 0 {
		want := map[string]bool{}
		for _, d := range p.Pattern.ByWeekday {
			want[d] = true
		}
		// Find the first weekday on/after startDate
		for {
			ical := [...]string{"SU", "MO", "TU", "WE", "TH", "FR", "SA"}[first.Weekday()]
			if want[ical] {
				break
			}
			first = first.AddDate(0, 0, 1)
		}
	}

	// Compose local start and end times
	dtstart := time.Date(first.Year(), first.Month(), first.Day(), st.Hour(), st.Minute(), 0, 0, loc)
	end := time.Date(first.Year(), first.Month(), first.Day(), et.Hour(), et.Minute(), 0, 0, loc)
	if !end.After(dtstart) {
		// Overnight span
		end = end.Add(24 * time.Hour)
	}
	duration := end.Sub(dtstart)

	// Single occurrence case
	freq, err := toFreq(p.Pattern.Freq)
	if err != nil {
		return nil, time.Time{}, 0, err
	}
	if freq == -1 {
		// No RRULE needed; caller can treat as single event
		return nil, dtstart, duration, nil
	}

	// Build RRULE options
	opts := rrule.ROption{
		Dtstart: dtstart,
		Freq:    freq,
	}

	if len(p.Pattern.ByWeekday) > 0 {
		by := make([]rrule.Weekday, 0, len(p.Pattern.ByWeekday))
		for _, w := range p.Pattern.ByWeekday {
			by = append(by, toWeekday(w))
		}
		opts.Byweekday = by
	}

	// Prefer Count if provided; otherwise use Until; otherwise optional EndDate window.
	if p.Pattern.Count > 0 {
		opts.Count = p.Pattern.Count
	} else if p.Pattern.Until != "" {
		untilDate, err := time.ParseInLocation("2006-01-02", p.Pattern.Until, loc)
		if err != nil {
			return nil, time.Time{}, 0, fmt.Errorf("parse Pattern.Until: %w", err)
		}
		// Inclusive through end-of-day local time
		opts.Until = untilDate.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
	} else if p.EndDate != "" {
		e, err := time.ParseInLocation("2006-01-02", p.EndDate, loc)
		if err != nil {
			return nil, time.Time{}, 0, fmt.Errorf("parse EndDate: %w", err)
		}
		opts.Until = e.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
	}

	rule, err := rrule.NewRRule(opts)
	if err != nil {
		return nil, time.Time{}, 0, err
	}
	return rule, dtstart, duration, nil
}

type Occ struct {
	Start, End time.Time
}

// func ExpandOccurrences(loc *time.Location, rule *rrule.RRule, dtstart time.Time, duration time.Duration, p Payload) []Occ {
// 	// Limit expansion to [StartDate, EndDate] if provided
// 	var windowEnd time.Time
// 	if p.EndDate != "" {
// 		e, _ := time.ParseInLocation("2006-01-02", p.EndDate, loc)
// 		windowEnd = e.Add(23*time.Hour + 59*time.Minute)
// 	} else if !rule.OrigOptions.Until.IsZero() {
// 		windowEnd = rule.OrigOptions.Until
// 	} else {
// 		windowEnd = dtstart.AddDate(1, 0, 0) // safety cap
// 	}

// 	starts := rule.Between(dtstart.Add(-time.Second), windowEnd, true)
// 	occ := make([]Occ, 0, len(starts))
// 	for _, s := range starts {
// 		occ = append(occ, Occ{Start: s.In(loc), End: s.In(loc).Add(duration)})
// 	}
// 	return occ
// }

func BuildSet(loc *time.Location, rule *rrule.RRule, rdates, exdates []string) (*rrule.Set, error) {
	var set rrule.Set
	if rule != nil {
		set.RRule(rule)
	}
	for _, s := range rdates {
		t, err := ParseLocal(s, loc)
		if err != nil {
			return nil, fmt.Errorf("parse RDATE %q: %w", s, err)
		}
		set.RDate(t)
	}
	for _, s := range exdates {
		t, err := ParseLocal(s, loc)
		if err != nil {
			return nil, fmt.Errorf("parse EXDATE %q: %w", s, err)
		}
		set.ExDate(t)
	}
	return &set, nil
}

func PickWindowEnd(loc *time.Location, dtstart time.Time, p Payload, rule *rrule.RRule) (time.Time, error) {
	if p.Pattern.Until != "" {
		u, err := time.ParseInLocation("2006-01-02", p.Pattern.Until, loc)
		if err != nil {
			return time.Time{}, fmt.Errorf("parse Pattern.Until: %w", err)
		}
		return u.Add(23*time.Hour + 59*time.Minute + 59*time.Second), nil
	}
	if p.EndDate != "" {
		e, err := time.ParseInLocation("2006-01-02", p.EndDate, loc)
		if err != nil {
			return time.Time{}, fmt.Errorf("parse EndDate: %w", err)
		}
		return e.Add(23*time.Hour + 59*time.Minute + 59*time.Second), nil
	}
	if rule != nil && !rule.OrigOptions.Until.IsZero() {
		return rule.OrigOptions.Until, nil
	}
	return dtstart.AddDate(1, 0, 0), nil
}

func ExpandFromSet(loc *time.Location, set *rrule.Set, rule *rrule.RRule, dtstart time.Time, duration time.Duration, windowEnd time.Time) []Occ {
	if set == nil || (rule == nil && len((*set).All()) == 0) {
		return []Occ{{Start: dtstart, End: dtstart.Add(duration)}}
	}
	starts := set.Between(dtstart.Add(-time.Second), windowEnd, true)
	occ := make([]Occ, 0, len(starts))
	for _, s := range starts {
		sLocal := s.In(loc)
		occ = append(occ, Occ{Start: sLocal, End: sLocal.Add(duration)})
	}
	return occ
}
func ParseLocal(s string, loc *time.Location) (time.Time, error) {
	return time.ParseInLocation("2006-01-02T15:04", s, loc)
}
func ParseLocalArray(s []string, loc *time.Location) ([]time.Time, error) {
	t := make([]time.Time, len(s))
	for i, s := range s {
		t[i], _ = ParseLocal(s, loc)
	}
	return t, nil
}
