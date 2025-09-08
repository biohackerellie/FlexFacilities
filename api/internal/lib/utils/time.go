package utils

import (
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func CombineDateAndTime(loc *time.Location, d pgtype.Date, t pgtype.Time) (time.Time, error) {
	if !d.Valid || !t.Valid {
		return time.Time{}, errors.New("invalid date or time")
	}
	year, month, day := d.Time.In(loc).Date()

	us := t.Microseconds % int64(24*time.Hour/time.Microsecond)
	h := int(us / int64(time.Hour/time.Microsecond))
	us -= int64(h) * int64(time.Hour/time.Microsecond)
	m := int(us / int64(time.Minute/time.Microsecond))
	us -= int64(m) * int64(time.Minute/time.Microsecond)
	s := int(us / int64(time.Second/time.Microsecond))
	us -= int64(s) * int64(time.Second/time.Microsecond)
	nsec := int(us) * 1000

	return time.Date(year, month, day, h, m, s, nsec, loc), nil
}

// Generate weekly occurrences on specified weekdays until endDate (inclusive).
// weekdays: time.Monday .. time.Sunday
func WeeklyOccurrences(loc *time.Location, startDate time.Time, endDate time.Time, weekdays map[time.Weekday]bool, startClock, endClock time.Duration) []struct{ Start, End time.Time } {
	out := []struct{ Start, End time.Time }{}
	// normalize to midnight local
	cur := time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, loc)
	for !cur.After(endDate) {
		if weekdays[cur.Weekday()] {
			start := cur.Add(startClock)
			end := cur.Add(endClock)
			// If end crosses midnight, that’s okay — you could clamp or roll to next day if desired.
			out = append(out, struct{ Start, End time.Time }{Start: start, End: end})
		}
		cur = cur.AddDate(0, 0, 1) // calendar add (DST-safe)
	}
	return out
}
