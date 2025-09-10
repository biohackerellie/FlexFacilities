package calendar

import (
	"context"
	"time"
)

const (
	HOLIDAY_CAL_ID = "en.usa#holiday@group.v.calendar.google.com"
)

func (c *Calendar) USHolidayDates(ctx context.Context, from, to time.Time) ([]time.Time, error) {
	call := c.svc.Events.List(HOLIDAY_CAL_ID).
		TimeMin(from.Format(time.RFC3339)).
		TimeMax(to.Format(time.RFC3339)).
		SingleEvents(true).MaxResults(2500)
	evs, err := call.Do()
	if err != nil {
		return nil, err
	}

	var dates []time.Time
	for _, e := range evs.Items {
		if e.Start != nil && e.Start.Date != "" {
			d, _ := time.ParseInLocation("2006-01-02", e.Start.Date, c.loc)
			dates = append(dates, d)
		}
	}
	return dates, nil
}
