package handlers

import (
	"api/internal/lib/recur"
	"api/internal/lib/utils"
	"api/internal/models"
	"api/internal/ports"
	service "api/internal/proto/reservation"
	"api/pkg/calendar"
	"context"
	"errors"
	"fmt"
	"log/slog"
	"math"
	"sort"
	"time"

	"connectrpc.com/connect"
)

type ReservationHandler struct {
	reservationStore ports.ReservationStore
	facilityStore    ports.FacilityStore
	log              *slog.Logger
	timezone         *time.Location
	calendar         *calendar.Calendar
}

func NewReservationHandler(reservationStore ports.ReservationStore, log *slog.Logger, timezone *time.Location) *ReservationHandler {
	log.With(slog.Group("Core_ReservationHandler", slog.String("name", "reservation")))
	return &ReservationHandler{reservationStore: reservationStore, log: log, timezone: timezone}
}
func (a *ReservationHandler) GetAllReservations(ctx context.Context, req *connect.Request[service.GetAllReservationsRequest]) (*connect.Response[service.AllReservationsResponse], error) {
	res, err := a.reservationStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	reservations := make([]*service.FullReservation, len(res))
	for i, reservation := range res {
		reservations[i] = reservation.ToProto()
	}
	return connect.NewResponse(&service.AllReservationsResponse{
		Reservations: reservations,
	}), nil
}

func (a *ReservationHandler) GetReservation(ctx context.Context, req *connect.Request[service.GetReservationRequest]) (*connect.Response[service.FullReservation], error) {
	res, err := a.reservationStore.Get(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	protoRes := res.ToProto()
	return connect.NewResponse(&service.FullReservation{
		Reservation: protoRes.Reservation,
		Dates:       protoRes.Dates,
		Fees:        protoRes.Fees,
	}), nil
}

func (a *ReservationHandler) RequestCount(ctx context.Context, req *connect.Request[service.RequestCountRequest]) (*connect.Response[service.RequestCountResponse], error) {
	res, err := a.reservationStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	var pendingCount int64
	for _, r := range res {
		if r.Reservation.Approved == "pending" {
			pendingCount++
		}
	}
	return connect.NewResponse(&service.RequestCountResponse{
		Count: pendingCount,
	}), nil
}

func (a *ReservationHandler) GetRequestsThisWeek(ctx context.Context, req *connect.Request[service.GetRequestsThisWeekRequest]) (*connect.Response[service.RequestThisWeekResponse], error) {
	requests, err := a.reservationStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	sevenDaysFromNow := time.Now().Add(time.Hour * 24 * 7)
	filtered := make([]*service.FullReservation, 0)
	for _, r := range requests {
		if r.Reservation.Approved != "denied" {
			for _, d := range r.Dates {
				if d.LocalStart.Time.After(time.Now()) && d.LocalStart.Time.Before(sevenDaysFromNow) {
					filtered = append(filtered, r.ToProto())
				}
			}
		}
	}
	return connect.NewResponse(&service.RequestThisWeekResponse{
		Reservations: filtered,
	}), nil
}

func (a *ReservationHandler) CreateReservation(ctx context.Context, req *connect.Request[service.CreateReservationRequest]) (*connect.Response[service.CreateReservationResponse], error) {
	loc := a.timezone
	hasOcc := req.Msg.Occurrences != nil && len(req.Msg.Occurrences) > 0
	hasRec := (req.Msg.Pattern != nil && req.Msg.Pattern.Freq != "") ||
		len(req.Msg.Rdates) > 0 || len(req.Msg.Exdates) > 0

	var pat recur.RecurrencePattern
	if req.Msg.Pattern != nil {
		pat = recur.RecurrencePattern{
			Freq:      req.Msg.Pattern.Freq,
			ByWeekday: req.Msg.Pattern.ByWeekday,
			Until:     req.Msg.Pattern.Until,
			Count:     int(req.Msg.Pattern.Count),
		}
	}
	if hasOcc == hasRec {
		return nil, errors.New("invalid request, must have either occurrences or recurrence, not both.")
	}

	var rruleStr *string
	var rdatesLocal, exdatesLocal []time.Time
	var occ []recur.Occ

	if hasOcc {
		for _, o := range req.Msg.Occurrences {
			start, startErr := recur.ParseLocal(o.Start, loc)
			end, endErr := recur.ParseLocal(o.End, loc)
			if startErr != nil || endErr != nil || !end.After(start) {
				return nil, fmt.Errorf("invalid occurrence: %v", o)
			}
			occ = append(occ, recur.Occ{Start: start, End: end})
		}
	} else {
		p := recur.Payload{
			StartDate: req.Msg.StartDate,
			EndDate:   req.Msg.EndDate,
			StartTime: req.Msg.StartTime,
			EndTime:   req.Msg.EndTime,
			Pattern:   pat,
			RDates:    req.Msg.Rdates,
			EXDates:   req.Msg.Exdates,
		}

		rule, dstart, dur, err := recur.BuildRRule(loc, p)
		if err != nil {
			return nil, err
		}
		set, err := recur.BuildSet(loc, rule, p.RDates, p.EXDates)
		if err != nil {
			return nil, err
		}

		windowEnd, err := recur.PickWindowEnd(loc, dstart, p, rule)
		if err != nil {
			return nil, err
		}

		occ = recur.ExpandFromSet(loc, set, rule, dstart, dur, windowEnd)

		if rule != nil {
			rs := rule.String()
			rruleStr = &rs
		}
		rdatesLocal, err = recur.ParseLocalArray(p.RDates, loc)
		if err != nil {
			return nil, err
		}
		exdatesLocal, err = recur.ParseLocalArray(p.EXDates, loc)
		if err != nil {
			return nil, err
		}

	}

	if len(occ) == 0 {
		return nil, errors.New("no occurrences generated")
	}

	if len(occ) > 500 {
		return nil, errors.New("too many occurrences")
	}

	id, err := a.reservationStore.Create(ctx, &models.Reservation{
		UserID:       req.Msg.UserId,
		EventName:    req.Msg.EventName,
		FacilityID:   req.Msg.FacilityId,
		Approved:     models.ReservationApprovedPending,
		Details:      &req.Msg.Details,
		Insurance:    false,
		CategoryID:   req.Msg.CategoryId,
		Name:         &req.Msg.Name,
		Phone:        &req.Msg.Phone,
		TechSupport:  &req.Msg.TechSupport,
		TechDetails:  req.Msg.TechDetails,
		DoorAccess:   &req.Msg.DoorAccess,
		DoorsDetails: req.Msg.DoorsDetails,
		RRule:        rruleStr,
		RDates:       rdatesLocal,
		EXDates:      exdatesLocal,
	})

	if err != nil {
		return nil, err
	}
	sort.Slice(occ, func(i, j int) bool { return occ[i].Start.Before(occ[j].Start) })
	dates := make([]models.ReservationDate, len(occ))
	for i, o := range occ {
		dates[i] = models.ReservationDate{
			ReservationID: id,
			LocalStart:    utils.TimeToPgTimestamp(o.Start),
			LocalEnd:      utils.TimeToPgTimestamp(o.End),
			Approved:      models.ReservationDateApprovedPending,
		}
	}
	err = a.reservationStore.CreateDates(ctx, dates)

	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.CreateReservationResponse{
		Id: id,
	}), nil
}

func (a *ReservationHandler) UpdateReservation(ctx context.Context, req *connect.Request[service.UpdateReservationRequest]) (*connect.Response[service.UpdateReservationResponse], error) {
	reservation := req.Msg.GetReservation()
	err := a.reservationStore.Update(ctx, models.ToReservation(reservation))
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.UpdateReservationResponse{}), nil
}
func (a *ReservationHandler) UpdateReservationStatus(ctx context.Context, req *connect.Request[service.UpdateReservationStatusRequest]) (*connect.Response[service.UpdateReservationResponse], error) {
	status := models.ReservationApproved(req.Msg.GetStatus())
	id := req.Msg.GetId()
	resWrap, err := a.reservationStore.Get(ctx, id)
	if err != nil {
		a.log.Error("Reservation not found", "id", id)
		return nil, err
	}
	res := resWrap.Reservation

	if res.Approved == status && status != models.ReservationApprovedApproved {
		return connect.NewResponse(&service.UpdateReservationResponse{}), nil
	}

	res.Approved = status
	if status != models.ReservationApprovedApproved {
		if err := a.reservationStore.Update(ctx, res); err != nil {
			return nil, err
		}
		return connect.NewResponse(&service.UpdateReservationResponse{}), nil
	}

	a.log.Debug("Reservation approved", "id", id)

	facility, err := a.facilityStore.Get(ctx, res.FacilityID)
	if err != nil {
		a.log.Error("Facility not found", "id", res.FacilityID)
		return nil, err
	}
	plan := buildPublishPlan(*res, resWrap.Dates, true)
	if plan.Mode == calendar.ModeSeries && res.GCalEventID != nil && *res.GCalEventID != "" {
		a.log.Warn("Reservation already published", "id", id)
		for i := range resWrap.Dates {
			if resWrap.Dates[i].Approved != models.ReservationDateApprovedApproved {
				resWrap.Dates[i].Approved = models.ReservationDateApprovedApproved
				if err := a.reservationStore.UpdateDate(ctx, &resWrap.Dates[i]); err != nil {
					a.log.Error("Failed to update approval for date", resWrap.Dates[i].ID, "err", err)
				}
			}
		}
		if err := a.reservationStore.Update(ctx, res); err != nil {
			return nil, err
		}
		return connect.NewResponse(&service.UpdateReservationResponse{}), nil
	}
	description := ""
	if res.Details != nil {
		description = *res.Details
	}
	pubRes, err := a.calendar.Publish(ctx, plan, calendar.PublishOptions{
		CalendarID:  facility.Facility.GoogleCalendarID,
		Summary:     res.EventName,
		Description: description,
		Location:    fmt.Sprintf("%s %s", facility.Building.Name, facility.Facility.Name),
		SendUpdates: calendar.NoUpdates,
	})
	if err != nil {
		return nil, err
	}
	switch plan.Mode {
	case calendar.ModeSingles:
		dateByID := make(map[int64]*models.ReservationDate, len(resWrap.Dates))
		for i := range resWrap.Dates {
			d := &resWrap.Dates[i]
			dateByID[d.ID] = d
		}

		for refID, eventID := range pubRes.SingleEventID {
			d := dateByID[refID]
			if d == nil {
				a.log.Warn("Publish returned event for unknown date id", "refID", refID)
				continue
			}
			if d.GcalEventid != nil && *d.GcalEventid == eventID && d.Approved == models.ReservationDateApprovedApproved {
				continue
			}
			d.GcalEventid = &eventID
			d.Approved = models.ReservationDateApprovedApproved
			if err := a.reservationStore.UpdateDate(ctx, d); err != nil {
				a.log.Error("Failed to update approval for date", d.ID, "err", err)
			}
		}
	case calendar.ModeSeries:
		if pubRes.MasterEventID != nil && *pubRes.MasterEventID != "" {
			res.GCalEventID = pubRes.MasterEventID
		}
		for i := range resWrap.Dates {
			resWrap.Dates[i].Approved = models.ReservationDateApprovedApproved
			if err := a.reservationStore.UpdateDate(ctx, &resWrap.Dates[i]); err != nil {
				a.log.Error("Failed to update date after series published", "date_id", resWrap.Dates[i].ID, "err", err)
			}
		}
	}

	if err := a.reservationStore.Update(ctx, res); err != nil {
		a.log.Error("Failed to update reservation after publish", "id", id, "err", err)
		return nil, err
	}
	return connect.NewResponse(&service.UpdateReservationResponse{}), nil
}

func (a *ReservationHandler) DeleteReservation(ctx context.Context, req *connect.Request[service.DeleteReservationRequest]) (*connect.Response[service.DeleteReservationResponse], error) {
	err := a.reservationStore.Delete(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteReservationResponse{}), nil
}

func (a *ReservationHandler) UserReservations(ctx context.Context, req *connect.Request[service.UserReservationsRequest]) (*connect.Response[service.UserReservationsResponse], error) {
	res, err := a.reservationStore.GetUserReservations(ctx, req.Msg.GetUserId())
	if err != nil {
		return nil, err
	}
	reservations := make([]*service.FullReservation, len(res))
	for i, reservation := range res {
		reservations[i] = reservation.ToProto()
	}
	return connect.NewResponse(&service.UserReservationsResponse{
		Reservations: reservations,
	}), nil
}

func (a *ReservationHandler) CreateReservationDates(ctx context.Context, req *connect.Request[service.CreateReservationDatesRequest]) (*connect.Response[service.CreateReservationDatesResponse], error) {
	dates := models.ToReservationDates(req.Msg.GetDate())
	err := a.reservationStore.CreateDates(ctx, dates)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.CreateReservationDatesResponse{}), nil
}

func (a *ReservationHandler) UpdateReservationDates(ctx context.Context, req *connect.Request[service.UpdateReservationDatesRequest]) (*connect.Response[service.UpdateReservationDatesResponse], error) {
	dates := models.ToReservationDates(req.Msg.GetDate())
	for _, d := range dates {
		err := a.reservationStore.UpdateDate(ctx, &d)
		if err != nil {
			return nil, err
		}
	}
	return connect.NewResponse(&service.UpdateReservationDatesResponse{}), nil
}

func (a *ReservationHandler) UpdateReservationDatesStatus(
	ctx context.Context,
	req *connect.Request[service.UpdateReservationDatesStatusRequest],
) (*connect.Response[service.UpdateReservationDatesStatusResponse], error) {
	ids := req.Msg.GetIds()
	if len(ids) == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("no ids provided"))
	}
	targetStatus := models.ReservationDateApproved(req.Msg.GetStatus())

	rows, err := a.reservationStore.GetDates(ctx, ids)
	if err != nil {
		return nil, err
	}
	if len(rows) != len(ids) {
		return nil, connect.NewError(connect.CodeNotFound, fmt.Errorf("some ids not found"))
	}

	resID := rows[0].ReservationID
	for _, r := range rows {
		if r.ReservationID != resID {
			return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("ids must belong to the same reservation"))
		}
	}

	wrap, err := a.reservationStore.Get(ctx, resID)
	if err != nil {
		return nil, err
	}
	res := wrap.Reservation

	facility, err := a.facilityStore.Get(ctx, res.FacilityID)
	if err != nil {
		return nil, err
	}

	// Guard: if a series was already published for this reservation, disallow per-date changes (or handle via EXDATE in a separate flow)
	if res.GCalEventID != nil && *res.GCalEventID != "" {
		return nil, connect.NewError(connect.CodeFailedPrecondition, fmt.Errorf("reservation already published as a series; per-date updates not supported here"))
	}

	calendarID := facility.Facility.GoogleCalendarID
	summary := res.EventName
	description := ""
	if res.Details != nil {
		description = *res.Details
	}
	location := fmt.Sprintf("%s %s", facility.Building.Name, facility.Facility.Name)

	switch targetStatus {
	case models.ReservationDateApprovedApproved:
		var singles []calendar.OccSpec
		for _, r := range rows {
			if r.GcalEventid != nil && *r.GcalEventid != "" {
				continue // already published
			}
			singles = append(singles, calendar.OccSpec{
				Start:       r.LocalStart.Time, // or r.LocalStart if time.Time directly
				End:         r.LocalEnd.Time,
				RefID:       r.ID,
				Summary:     summary,
				Description: description,
				Location:    location,
			})
		}

		// Publish in one batch
		var pubRes *calendar.PublishResult
		if len(singles) > 0 {
			pubRes, err = a.calendar.Publish(ctx, &calendar.PublishPlan{
				Mode:    calendar.ModeSingles,
				Singles: singles,
			}, calendar.PublishOptions{
				CalendarID:  calendarID,
				Summary:     summary,
				Description: description,
				Location:    location,
				SendUpdates: calendar.NoUpdates,
			})
			if err != nil {
				return nil, err
			}
		}

		// Update DB rows: set approved + gcal_eventid

		for i := range rows {
			r := &rows[i]
			r.Approved = models.ReservationDateApprovedApproved
			if pubRes != nil {
				if evID, ok := pubRes.SingleEventID[r.ID]; ok {
					r.GcalEventid = &evID
				}
			}
			if err = a.reservationStore.UpdateDate(ctx, r); err != nil {
				return nil, err
			}
		}
		// Optionally mark reservation itself approved if all dates are approved
		if res.Approved == models.ReservationApprovedPending {
			res.Approved = models.ReservationApprovedApproved
			if err = a.reservationStore.Update(ctx, res); err != nil {
				return nil, err
			}
		}

	case models.ReservationDateApprovedDenied, models.ReservationDateApprovedPending:
		// For deny/pending: delete Google events if present, then update rows
		for _, r := range rows {
			if r.GcalEventid != nil && *r.GcalEventid != "" {
				if err = a.calendar.DeleteEvent(calendarID, *r.GcalEventid); err != nil {
					a.log.Error("Failed to delete event", "id", *r.GcalEventid, "err", err)
				}
			}
		}
		for i := range rows {
			r := &rows[i]
			r.Approved = targetStatus
			// Clear gcal id if we deleted it
			if r.GcalEventid != nil {
				r.GcalEventid = nil
			}
			if err = a.reservationStore.UpdateDate(ctx, r); err != nil {
				return nil, err
			}
		}
	default:
		return nil, connect.NewError(connect.CodeInvalidArgument, fmt.Errorf("unknown status %q", req.Msg.GetStatus()))
	}

	return connect.NewResponse(&service.UpdateReservationDatesStatusResponse{}), nil
}

func (a *ReservationHandler) DeleteReservationDates(ctx context.Context, req *connect.Request[service.DeleteReservationDatesRequest]) (*connect.Response[service.DeleteReservationDatesResponse], error) {
	err := a.reservationStore.DeleteDates(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteReservationDatesResponse{}), nil
}

func (a *ReservationHandler) CreateReservationFee(ctx context.Context, req *connect.Request[service.CreateReservationFeeRequest]) (*connect.Response[service.CreateReservationFeeResponse], error) {
	fees := models.ToReservationFees(req.Msg.GetFee())
	for i := range fees {
		a.reservationStore.CreateFee(ctx, fees[i])
	}
	return connect.NewResponse(&service.CreateReservationFeeResponse{}), nil
}

func (a *ReservationHandler) UpdateReservationFee(ctx context.Context, req *connect.Request[service.UpdateReservationFeeRequest]) (*connect.Response[service.UpdateReservationFeeResponse], error) {
	// fee := models.ToReservationFee(req.Msg.GetFee())
	// err := a.reservationStore.Update(ctx, fee)
	// if err != nil {
	// 	return nil, err
	// }
	return connect.NewResponse(&service.UpdateReservationFeeResponse{}), nil
}

func (a *ReservationHandler) DeleteReservationFee(ctx context.Context, req *connect.Request[service.DeleteReservationFeeRequest]) (*connect.Response[service.DeleteReservationFeeResponse], error) {
	err := a.reservationStore.DeleteFees(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteReservationFeeResponse{}), nil
}

// Get the total cost of the reservation, rounded to 2 decimal places
func (a *ReservationHandler) CostReducer(ctx context.Context, req *connect.Request[service.CostReducerRequest]) (*connect.Response[service.CostReducerResponse], error) {
	reservation, err := a.reservationStore.Get(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	ids := []int64{reservation.Reservation.CategoryID}
	categories, err := a.facilityStore.GetCategories(ctx, ids)
	if err != nil {
		return nil, err
	}
	category := categories[0]
	var total time.Duration
	for _, date := range reservation.Dates {
		if date.Approved != models.ReservationDateApprovedApproved {
			continue
		}
		start := date.LocalStart.Time
		end := date.LocalEnd.Time
		if end.Before(start) {
			return nil, fmt.Errorf("end before start for date id %d", date.ID)
		}
		total += end.Sub(start)
	}
	totalMinutes := int64(total / time.Minute)
	fees := 0.0
	for _, fee := range reservation.Fees {
		fees += utils.PGNumericToFloat64(fee.AdditionalFees)
	}

	pricePerHourCents := int64(category.Price * 100)
	feeCents := int64(math.Round(fees * 100))
	costCents := int64(math.Round(float64(pricePerHourCents) * float64(totalMinutes) / 60.0))
	totalCents := max(costCents+feeCents, 0)
	stringCost := fmt.Sprintf("%.2f", float64(totalCents)/100.0)
	return connect.NewResponse(&service.CostReducerResponse{
		Cost: string(stringCost),
	}), nil
}

func buildPublishPlan(res models.Reservation, occs []models.ReservationDate, approveAll bool) *calendar.PublishPlan {
	if approveAll && res.RRule != nil {
		first := occs[0]
		return &calendar.PublishPlan{
			Mode: "series",
			Series: &calendar.SeriesSpec{
				Start:       first.LocalStart.Time,
				End:         first.LocalEnd.Time,
				RRULE:       *res.RRule,
				Summary:     res.EventName,
				Description: *res.Details,
			},
		}
	}
	var singles []calendar.OccSpec
	for _, occ := range occs {
		singles = append(singles, calendar.OccSpec{
			Start:       occ.LocalStart.Time,
			End:         occ.LocalEnd.Time,
			RefID:       occ.ID,
			Summary:     res.EventName,
			Description: *res.Details,
		})
	}
	return &calendar.PublishPlan{
		Mode:    "singles",
		Singles: singles,
	}
}

func filterApproved(dates []models.ReservationDate) []models.ReservationDate {
	var approved []models.ReservationDate
	for _, date := range dates {
		if date.Approved == models.ReservationDateApprovedApproved {
			approved = append(approved, date)
		}
	}
	return approved
}

func startsOf(dates []models.ReservationDate) []time.Time {
	var starts []time.Time
	for _, date := range dates {
		starts = append(starts, date.LocalStart.Time)
	}
	return starts
}
