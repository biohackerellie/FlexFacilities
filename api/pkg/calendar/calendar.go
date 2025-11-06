package calendar

import (
	"context"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	gcal "google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type Calendar struct {
	svc *gcal.Service
	loc time.Location
	tz  string
}

func NewCalendar(ctx context.Context, clientID, clientSecret, refreshToken string, loc time.Location, tz string) (*Calendar, error) {
	config := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     google.Endpoint,
		Scopes:       []string{gcal.CalendarScope},
	}
	token := &oauth2.Token{RefreshToken: refreshToken}

	client := config.Client(ctx, token)
	service, err := gcal.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return nil, err
	}
	cal := &Calendar{
		svc: service,
		loc: loc,
		tz:  tz,
	}
	return cal, nil
}

func (c *Calendar) ListEvents(calendarID string) (*gcal.Events, error) {
	now := time.Now()
	// only go back  1 month
	timeMin := now.AddDate(0, -1, 0).Format(time.RFC3339)
	timeMax := now.AddDate(0, 3, 0).Format(time.RFC3339)

	return c.svc.Events.
		List(calendarID).
		SingleEvents(true).
		TimeMin(timeMin).
		TimeMax(timeMax).
		MaxResults(1000).
		OrderBy("startTime").
		Do()
}

func (c *Calendar) InsertEvent(calendarID string, event *gcal.Event) (*gcal.Event, error) {
	return c.svc.Events.Insert(calendarID, event).Do()
}
func (c *Calendar) DeleteEvent(calendarID string, eventID string) error {
	return c.svc.Events.Delete(calendarID, eventID).Do()
}
