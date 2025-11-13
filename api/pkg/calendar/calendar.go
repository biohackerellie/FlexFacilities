package calendar

import (
	"context"
	"fmt"
	"log/slog"
	"math"
	"strings"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"golang.org/x/sync/semaphore"
	gcal "google.golang.org/api/calendar/v3"
	"google.golang.org/api/googleapi"
	"google.golang.org/api/option"
)

type Calendar struct {
	svc         *gcal.Service
	loc         time.Location
	tz          string
	rateLimiter *semaphore.Weighted
	logger      *slog.Logger
	maxRetries  int
}

// RateLimitConfig configures the rate limiting behavior
type RateLimitConfig struct {
	// MaxConcurrent limits the number of concurrent API calls (default: 5)
	MaxConcurrent int64
	// MaxRetries is the maximum number of retry attempts (default: 5)
	MaxRetries int
	// Logger for logging retry attempts and rate limit events
	Logger *slog.Logger
}

func NewCalendar(ctx context.Context, clientID, clientSecret, refreshToken string, loc time.Location, tz string) (*Calendar, error) {
	return NewCalendarWithRateLimit(ctx, clientID, clientSecret, refreshToken, loc, tz, nil)
}

func NewCalendarWithRateLimit(ctx context.Context, clientID, clientSecret, refreshToken string, loc time.Location, tz string, config *RateLimitConfig) (*Calendar, error) {
	oauthConfig := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     google.Endpoint,
		Scopes:       []string{gcal.CalendarScope},
	}
	token := &oauth2.Token{RefreshToken: refreshToken}

	client := oauthConfig.Client(ctx, token)
	service, err := gcal.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return nil, err
	}

	// Apply defaults if config is nil
	if config == nil {
		config = &RateLimitConfig{
			MaxConcurrent: 5,
			MaxRetries:    5,
			Logger:        slog.Default(),
		}
	}
	if config.MaxConcurrent <= 0 {
		config.MaxConcurrent = 5
	}
	if config.MaxRetries <= 0 {
		config.MaxRetries = 5
	}
	if config.Logger == nil {
		config.Logger = slog.Default()
	}

	cal := &Calendar{
		svc:         service,
		loc:         loc,
		tz:          tz,
		rateLimiter: semaphore.NewWeighted(config.MaxConcurrent),
		logger:      config.Logger,
		maxRetries:  config.MaxRetries,
	}
	return cal, nil
}

// withRateLimit wraps an API call with rate limiting and exponential backoff
func (c *Calendar) withRateLimit(ctx context.Context, operation string, fn func() error) error {
	// Acquire semaphore to limit concurrent requests
	if err := c.rateLimiter.Acquire(ctx, 1); err != nil {
		return fmt.Errorf("failed to acquire rate limiter: %w", err)
	}
	defer c.rateLimiter.Release(1)

	// Retry with exponential backoff
	var lastErr error
	for attempt := 0; attempt <= c.maxRetries; attempt++ {
		if attempt > 0 {
			// Calculate backoff: 2^attempt * 100ms, max 30 seconds
			backoff := time.Duration(math.Pow(2, float64(attempt))) * 100 * time.Millisecond
			if backoff > 30*time.Second {
				backoff = 30 * time.Second
			}

			c.logger.Warn("Retrying API call after rate limit",
				"operation", operation,
				"attempt", attempt,
				"backoff", backoff.String(),
			)

			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(backoff):
			}
		}

		err := fn()
		if err == nil {
			return nil
		}

		// Check if it's a rate limit error
		if isRateLimitError(err) {
			lastErr = err
			continue
		}

		// If it's not a rate limit error, return immediately
		return err
	}

	return fmt.Errorf("max retries exceeded for %s: %w", operation, lastErr)
}

// isRateLimitError checks if an error is a rate limit error
func isRateLimitError(err error) bool {
	if err == nil {
		return false
	}

	// Check for Google API error
	if apiErr, ok := err.(*googleapi.Error); ok {
		// Rate limit errors are typically 403 or 429
		if apiErr.Code == 403 || apiErr.Code == 429 {
			// Check error message for rate limit indicators
			errMsg := strings.ToLower(apiErr.Message)
			return strings.Contains(errMsg, "rate") ||
				strings.Contains(errMsg, "quota") ||
				strings.Contains(errMsg, "limit")
		}
	}

	return false
}

func (c *Calendar) ListEvents(calendarID string) (*gcal.Events, error) {
	return c.ListEventsWithContext(context.Background(), calendarID)
}

func (c *Calendar) ListEventsWithContext(ctx context.Context, calendarID string) (*gcal.Events, error) {
	var result *gcal.Events

	err := c.withRateLimit(ctx, "ListEvents", func() error {
		now := time.Now()
		// only go back 1 month
		timeMin := now.AddDate(0, -1, 0).Format(time.RFC3339)
		timeMax := now.AddDate(0, 3, 0).Format(time.RFC3339)

		events, err := c.svc.Events.
			List(calendarID).
			SingleEvents(true).
			TimeMin(timeMin).
			TimeMax(timeMax).
			MaxResults(1000).
			OrderBy("startTime").
			Do()

		if err == nil {
			result = events
		}
		return err
	})

	return result, err
}

func (c *Calendar) InsertEvent(calendarID string, event *gcal.Event) (*gcal.Event, error) {
	return c.InsertEventWithContext(context.Background(), calendarID, event)
}

func (c *Calendar) InsertEventWithContext(ctx context.Context, calendarID string, event *gcal.Event) (*gcal.Event, error) {
	var result *gcal.Event

	err := c.withRateLimit(ctx, "InsertEvent", func() error {
		inserted, err := c.svc.Events.Insert(calendarID, event).Do()
		if err == nil {
			result = inserted
		}
		return err
	})

	return result, err
}

func (c *Calendar) DeleteEvent(calendarID string, eventID string) error {
	return c.DeleteEventWithContext(context.Background(), calendarID, eventID)
}

func (c *Calendar) DeleteEventWithContext(ctx context.Context, calendarID string, eventID string) error {
	return c.withRateLimit(ctx, "DeleteEvent", func() error {
		return c.svc.Events.Delete(calendarID, eventID).Do()
	})
}
