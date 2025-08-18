package calendar

import (
	"context"
	"fmt"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type Calendar struct {
	c *calendar.Service
}

func NewCalendar(ctx context.Context) (*Calendar, error) {

	config := &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		Endpoint:     google.Endpoint,
		Scopes:       []string{calendar.CalendarScope},
	}
	token := &oauth2.Token{RefreshToken: os.Getenv("GOOGLE_REFRESH_TOKEN")}

	client := config.Client(ctx, token)
	service, err := calendar.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return nil, err
	}
	str := service.CalendarList.List()
	fmt.Println(str.Fields("items"))

	return &Calendar{c: service}, nil

}

func (c *Calendar) ListEvents(calendarID string) (*calendar.Events, error) {
	return c.c.Events.List(calendarID).SingleEvents(true).MaxResults(1000).Do()
}

func (c *Calendar) InsertEvent(calendarID string, event *calendar.Event) (*calendar.Event, error) {
	return c.c.Events.Insert(calendarID, event).Do()
}
