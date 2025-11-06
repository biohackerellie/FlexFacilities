package db

import (
	"api/internal/lib/utils"
	"api/internal/models"
	"context"
	"database/sql"
	"errors"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jmoiron/sqlx"
)

type ReservationStore struct {
	log *slog.Logger
	db  *DB
}

func NewReservationStore(db *DB, log *slog.Logger) *ReservationStore {
	log.With("layer", "db", "store", "reservation")
	return &ReservationStore{db: db, log: log}
}

const getReservationQuery = "SELECT * FROM reservation WHERE id = $1 LIMIT 1"

func (s *ReservationStore) Get(ctx context.Context, id int64) (*models.FullReservation, error) {
	var reservation models.Reservation
	stmt, _ := s.db.PreparexContext(ctx, getReservationQuery)
	defer func() { _ = stmt.Close() }()
	if err := stmt.GetContext(ctx, &reservation, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	dates, err := s.GetDates(ctx, []int64{reservation.ID})
	if err != nil {
		return nil, err
	}
	fees, err := s.GetFees(ctx, []int64{reservation.ID})
	if err != nil {
		return nil, err
	}
	return &models.FullReservation{
		Reservation: reservation,
		Dates:       dates,
		Fees:        fees,
	}, nil
}

const getAllReservationsQuery = "SELECT * FROM reservation"

func (s *ReservationStore) GetAll(ctx context.Context) ([]models.FullReservation, error) {
	var reservations []models.Reservation
	stmt, err := s.db.PreparexContext(ctx, getAllReservationsQuery)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	if err := stmt.SelectContext(ctx, &reservations); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	reservationIds := make([]int64, len(reservations))
	for _, res := range reservations {
		reservationIds = append(reservationIds, res.ID)
	}
	dates, err := s.GetDates(ctx, reservationIds)
	if err != nil {
		return nil, err
	}
	fees, err := s.GetFees(ctx, reservationIds)
	if err != nil {
		return nil, err
	}
	return toFullReservations(reservations, dates, fees), nil
}

const getAllReservationsInQuery = "SELECT * FROM reservation WHERE id IN (?)"

func (s *ReservationStore) GetAllIn(ctx context.Context, ids []int64) ([]models.FullReservation, error) {
	var reservations []models.Reservation
	query, args, err := sqlx.In(getAllReservationsInQuery, ids)
	if err != nil {
		return nil, err
	}
	query = s.db.Rebind(query)
	err = s.db.SelectContext(ctx, &reservations, query, args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	dates, err := s.GetDates(ctx, ids)
	if err != nil {
		return nil, err
	}
	fees, err := s.GetFees(ctx, ids)
	if err != nil {
		return nil, err
	}
	return toFullReservations(reservations, dates, fees), nil
}

const getUserReservationsQuery = "SELECT * FROM reservation WHERE user_id = $1"

func (s *ReservationStore) GetUserReservations(ctx context.Context, userID string) ([]models.FullReservation, error) {
	var reservations []models.Reservation
	err := s.db.SelectContext(ctx, &reservations, getUserReservationsQuery, userID)
	if err != nil {
		s.log.Error("failed to get user reservations", "error", err)
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	var reservationIds []int64
	for _, res := range reservations {
		reservationIds = append(reservationIds, res.ID)
	}

	dates, err := s.GetDates(ctx, reservationIds)
	if err != nil {
		return nil, err
	}
	fees, err := s.GetFees(ctx, reservationIds)
	if err != nil {
		return nil, err
	}
	s.log.Debug("got user reservations", "count", len(reservations), "dates", len(dates), "fees", len(fees))

	result := toFullReservations(reservations, dates, fees)
	return result, nil
}

const createReservationQuery = `
INSERT INTO reservation (
    user_id,
    event_name,
    facility_id,
    approved,
    details,
    insurance,
    door_access,
    doors_details,
    name,
    tech_details,
    tech_support,
    phone,
    category_id,
		rrule,
		rdates,
		exdates
) VALUES (
    :user_id,
    :event_name,
    :facility_id,
    :approved,
    :details,
    :insurance,
    :door_access,
    :doors_details,
    :name,
    :tech_details,
    :tech_support,
    :phone,
    :category_id,
		:rrule,
		:rdates,
		:exdates
)
RETURNING id`

func (s *ReservationStore) Create(ctx context.Context, reservation *models.Reservation) (int64, error) {

	var id int64
	args := map[string]any{
		"user_id":       reservation.UserID,
		"event_name":    reservation.EventName,
		"facility_id":   reservation.FacilityID,
		"approved":      reservation.Approved,
		"details":       reservation.Details,
		"insurance":     reservation.Insurance,
		"door_access":   reservation.DoorAccess,
		"doors_details": reservation.DoorsDetails,
		"name":          reservation.Name,
		"tech_details":  reservation.TechDetails,
		"tech_support":  reservation.TechSupport,
		"phone":         reservation.Phone,
		"category_id":   reservation.CategoryID,
		"rrule":         reservation.RRule,
		"rdates":        nil,
		"exdates":       nil,
	}
	if reservation.RDates != nil && len(*reservation.RDates) > 0 {
		args["rdates"] = reservation.RDates
	}
	if reservation.EXDates != nil && len(*reservation.EXDates) > 0 {
		args["exdates"] = reservation.EXDates
	}
	rows, err := s.db.NamedQueryContext(ctx, createReservationQuery, args)
	if err != nil {
		s.log.Error("failed to insert reservation into db", "error", err)
		return 0, err
	}
	defer rows.Close()
	if rows.Next() {
		_ = rows.Scan(&id)
	}

	return id, nil
}

const createReservationDatesQuery = `INSERT INTO reservation_date (
	reservation_id,
	approved,
	local_start,
	local_end
) VALUES (
	$1,
	$2,
	$3,
	$4
)`

func (s *ReservationStore) CreateDates(ctx context.Context, dates []models.ReservationDate) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	for _, date := range dates {
		if _, err := tx.ExecContext(ctx, createReservationDatesQuery, date.ReservationID, date.Approved, date.LocalStart, date.LocalEnd); err != nil {
			s.log.Error("failed to insert reservation date into db", "error", err, "date", date)
			err = tx.Rollback()
			if err != nil {
				return err
			}
			return err
		}
	}
	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}

const createReservationFeesQuery = `INSERT INTO reservation_fees (
	additional_fees,
	fees_type,
	reservation_id
) VALUES (
	:additionalFees,
	:feesType,
	:reservationId
)`

func (s *ReservationStore) CreateFee(ctx context.Context, fee models.ReservationFee) error {
	stmt, err := s.db.PreparexContext(ctx, createReservationFeesQuery)
	if err != nil {
		return err
	}
	defer stmt.Close()
	params := map[string]any{
		"additionalFees": fee.AdditionalFees,
		"feesType":       fee.FeesType,
		"reservationId":  fee.ReservationID,
	}
	if _, err := stmt.ExecContext(ctx, params); err != nil {
		return err
	}
	return nil
}

const updateReservationQuery = `UPDATE reservation SET
	approved = :approved,
	updated_at = :updatedAt,
	insurance = :insurance,
	category_id = :categoryId,
	total_hours = :totalHours,
	in_person = :inPerson,
	paid = :paid,
	payment_url = :paymentUrl,
	payment_link_id = :paymentLinkId,
	insurance_link = :insuranceLink,
	gcal_eventid = :gcalEventid
WHERE id = :id`

func (s *ReservationStore) Update(ctx context.Context, reservation *models.Reservation) error {
	params := map[string]any{
		"approved":      reservation.Approved.String(),
		"updatedAt":     pgtype.Timestamp{Time: time.Now(), Valid: true},
		"insurance":     reservation.Insurance,
		"categoryId":    reservation.CategoryID,
		"totalHours":    reservation.TotalHours,
		"inPerson":      reservation.InPerson,
		"paid":          reservation.Paid,
		"paymentUrl":    reservation.PaymentUrl,
		"paymentLinkId": reservation.PaymentLinkID,
		"insuranceLink": reservation.InsuranceLink,
		"gcalEventid":   reservation.GCalEventID,
		"id":            reservation.ID,
	}
	s.log.Debug("updating reservation", "params", params)
	if _, err := s.db.NamedExecContext(ctx, updateReservationQuery, params); err != nil {
		return err
	}
	return nil
}

const deleteReservationQuery = `DELETE FROM reservation WHERE id = $1`

func (s *ReservationStore) Delete(ctx context.Context, id int64) error {
	_, err := s.db.ExecContext(ctx, deleteReservationQuery, id)
	return err
}

const deleteReservationDatesQuery = `DELETE FROM reservation_date WHERE id IN (?)`

func (s *ReservationStore) DeleteDates(ctx context.Context, id []int64) error {
	query, args, err := sqlx.In(deleteReservationDatesQuery, id)
	if err != nil {
		return err
	}
	query = s.db.Rebind(query)
	_, err = s.db.ExecContext(ctx, query, args...)
	return err
}

const deleteReservationFeesQuery = `DELETE FROM reservation_fees WHERE id = $1`

func (s *ReservationStore) DeleteFees(ctx context.Context, id int64) error {
	_, err := s.db.ExecContext(ctx, deleteReservationFeesQuery, id)
	return err
}

const updateCostOverrideQuery = `UPDATE reservation SET
	cost_override = :costOverride,
	updated_at = :updatedAt
	WHERE id = :id`

func (s *ReservationStore) UpdateCostOverride(ctx context.Context, id int64, cost string) error {
	numericCost := utils.StringToPgNumeric(cost)
	params := map[string]any{
		"costOverride": numericCost,
		"updatedAt":    time.Now(),
		"id":           id,
	}
	stmt, err := s.db.PreparexContext(ctx, updateCostOverrideQuery)
	if err != nil {
		return err
	}
	defer stmt.Close()
	if _, err := stmt.ExecContext(ctx, params); err != nil {
		return err
	}
	return nil
}

const updateReservationDatesQuery = `UPDATE reservation_date SET
	approved = :approved,
	gcal_eventid = :gcal_eventid,
	local_start = :local_start,
	local_end = :local_end
	WHERE id = :id`

func (s *ReservationStore) UpdateDate(ctx context.Context, date *models.ReservationDate) error {
	var calId string
	if date.GcalEventid != nil {
		calId = *date.GcalEventid
	}
	params := map[string]any{
		"approved":     date.Approved.String(),
		"gcal_eventid": calId,
		"local_start":  date.LocalStart,
		"local_end":    date.LocalEnd,
		"id":           date.ID,
	}
	s.log.Debug("updating reservation date", "params", params)
	if _, err := s.db.NamedExecContext(ctx, updateReservationDatesQuery, params); err != nil {
		return err
	}
	return nil
}

const getReservationDatesQuery = `SELECT * FROM reservation_date WHERE reservation_id IN (?)`

func (s *ReservationStore) GetDates(ctx context.Context, ids []int64) ([]models.ReservationDate, error) {
	var dates []models.ReservationDate
	query, args, err := sqlx.In(getReservationDatesQuery, ids)
	if err != nil {
		return nil, err
	}
	query = s.db.Rebind(query)
	err = s.db.SelectContext(ctx, &dates, query, args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			dates = []models.ReservationDate{}
		}
		return nil, err
	}
	return dates, nil
}

const getReservationFeesQuery = `SELECT * FROM reservation_fees WHERE reservation_id IN (?)`

func (s *ReservationStore) GetFees(ctx context.Context, ids []int64) ([]models.ReservationFee, error) {
	var fees []models.ReservationFee
	query, args, err := sqlx.In(getReservationFeesQuery, ids)
	if err != nil {
		return nil, err
	}
	query = s.db.Rebind(query)
	err = s.db.SelectContext(ctx, &fees, query, args...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			fees = []models.ReservationFee{}
		}
		return nil, err
	}
	return fees, nil
}

func toFullReservations(reservations []models.Reservation, dates []models.ReservationDate, fees []models.ReservationFee) []models.FullReservation {

	datesByReservation := make(map[int64][]models.ReservationDate)
	feesByReservation := make(map[int64][]models.ReservationFee)
	for _, date := range dates {
		datesByReservation[date.ReservationID] = append(datesByReservation[date.ReservationID], date)
	}
	for _, fee := range fees {
		feesByReservation[fee.ReservationID] = append(feesByReservation[fee.ReservationID], fee)
	}
	var fullReservations []models.FullReservation
	for i, res := range reservations {
		fr := models.FullReservation{
			Reservation: reservations[i],
			Dates:       datesByReservation[res.ID],
			Fees:        feesByReservation[res.ID],
		}
		fullReservations = append(fullReservations, fr)
	}
	return fullReservations
}

const getFutureDatesQuery = `SELECT * FROM reservation_date WHERE start_date > now()`

func (s *ReservationStore) GetFutureDates(ctx context.Context) ([]models.ReservationDate, error) {
	var dates models.ReservationDate

	err := s.db.GetContext(ctx, &dates, getFutureDatesQuery)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return []models.ReservationDate{dates}, nil
}

const aggregateQuery = `SELECT date_trunc('month', r.created_at) AS month_start,
	b.name AS building_name,
	COUNT(*) AS count
FROM reservation r
JOIN facility f ON r.facility_id = f.id
JOIN building b ON f.building_id = b.id
WHERE r.created_at > now() - INTERVAL '6 months'
GROUP BY month_start, building_name
ORDER BY month_start, building_name;
`

func (s *ReservationStore) Aggregate(ctx context.Context) ([]models.Aggregate, error) {
	var aggregates []models.Aggregate
	if err := s.db.SelectContext(ctx, &aggregates, aggregateQuery); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			aggregates = []models.Aggregate{}
		}
		return nil, err
	}
	return aggregates, nil
}
