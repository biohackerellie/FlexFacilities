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
		Reservation: &reservation,
		Dates:       dates,
		Fees:        fees,
	}, nil
}

const getAllReservationsQuery = "SELECT * FROM reservation"

func (s *ReservationStore) GetAll(ctx context.Context) ([]*models.FullReservation, error) {
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

func (s *ReservationStore) GetAllIn(ctx context.Context, ids []int64) ([]*models.FullReservation, error) {
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

func (s *ReservationStore) GetUserReservations(ctx context.Context, userID string) ([]*models.FullReservation, error) {
	var reservations []models.Reservation
	stmt, err := s.db.PreparexContext(ctx, getUserReservationsQuery)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	if err := stmt.SelectContext(ctx, &reservations, userID); err != nil {
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

const createReservationQuery = `INSERT INTO reservation (
	user_id,
	event_name,
	facility_id,
	approved,
	created_at,
	updated_at,
	details,
	fees,
	insurance,
	primary_contact,
	door_access,
	doors_details,
	name,
	people,
	tech_details,
	tech_support,
	phone,
	category_id,
	total_hours,
) VALUES (
	:userId,
	:eventName,
	:facilityId,
	:approved,
	:createdAt,
	:updatedAt,
	:details,
	:fees,
	:insurance,
	:primaryContact,
	:doorAccess,
	:doorsDetails,
	:name,
	:people,
	:techDetails,
	:techSupport,
	:phone,
	:categoryId,
	:totalHours
) RETURNING id`

func (s *ReservationStore) Create(ctx context.Context, reservation *models.Reservation) (int64, error) {
	params := map[string]any{
		"userId":       reservation.UserID,
		"eventName":    reservation.EventName,
		"facilityId":   reservation.FacilityID,
		"approved":     reservation.Approved,
		"createdAt":    reservation.CreatedAt,
		"updatedAt":    reservation.UpdatedAt,
		"details":      reservation.Details,
		"fees":         reservation.Fees,
		"insurance":    reservation.Insurance,
		"doorAccess":   reservation.DoorAccess,
		"doorsDetails": reservation.DoorsDetails,
		"name":         reservation.Name,
		"techDetails":  reservation.TechDetails,
		"techSupport":  reservation.TechSupport,
		"phone":        reservation.Phone,
		"categoryId":   reservation.CategoryID,
		"totalHours":   reservation.TotalHours,
	}

	var id int64
	stmt, err := s.db.PreparexContext(ctx, createReservationQuery)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()
	if err := stmt.GetContext(ctx, &id, params); err != nil {
		return 0, err
	}
	return id, nil
}

const createReservationDatesQuery = `INSERT INTO reservation_date (
	reservation_id,
	approved,
	local_start,
	local_end
) VALUES (
	:reservationId,
	:approved,
	:local_start,
	:local_end
)`

func (s *ReservationStore) CreateDates(ctx context.Context, dates []models.ReservationDate) error {
	stmt, err := s.db.PreparexContext(ctx, createReservationDatesQuery)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, date := range dates {
		params := map[string]any{
			"reservationId": date.ReservationID,
			"approved":      date.Approved,
			"local_start":   date.LocalStart,
			"local_end":     date.LocalEnd,
		}
		if _, err := stmt.ExecContext(ctx, params); err != nil {
			return err
		}
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
		"approved":      reservation.Approved,
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
	stmt, err := s.db.PreparexContext(ctx, updateReservationQuery)
	if err != nil {
		return err
	}
	defer stmt.Close()
	if _, err := stmt.ExecContext(ctx, params); err != nil {
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
	params := map[string]any{
		"approved":     date.Approved,
		"gcal_eventid": date.GcalEventid,
		"local_start":  date.LocalStart,
		"local_end":    date.LocalEnd,
		"id":           date.ID,
	}
	stmt, err := s.db.PreparexContext(ctx, updateReservationDatesQuery)
	if err != nil {
		return err
	}
	defer stmt.Close()
	if _, err := stmt.ExecContext(ctx, params); err != nil {
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

func toFullReservations(reservations []models.Reservation, dates []models.ReservationDate, fees []models.ReservationFee) []*models.FullReservation {

	datesByReservation := make(map[int64][]models.ReservationDate)
	feesByReservation := make(map[int64][]models.ReservationFee)
	for _, date := range dates {
		datesByReservation[date.ReservationID] = append(datesByReservation[date.ReservationID], date)
	}
	for _, fee := range fees {
		feesByReservation[fee.ReservationID] = append(feesByReservation[fee.ReservationID], fee)
	}
	fullReservations := make([]*models.FullReservation, len(reservations))
	for i, res := range reservations {
		fr := &models.FullReservation{
			Reservation: &reservations[i],
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
