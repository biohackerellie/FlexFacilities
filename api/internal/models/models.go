package models

import (
	"api/internal/lib/utils"
	pbSessions "api/internal/proto/auth"
	pbFacilities "api/internal/proto/facilities"
	pbReservation "api/internal/proto/reservation"
	pbUsers "api/internal/proto/users"
	"database/sql/driver"
	"fmt"
	"github.com/jackc/pgx/v5/pgtype"
)

type ReservationApproved string

const (
	ReservationApprovedPending  ReservationApproved = "pending"
	ReservationApprovedApproved ReservationApproved = "approved"
	ReservationApprovedDenied   ReservationApproved = "denied"
	ReservationApprovedCanceled ReservationApproved = "canceled"
)

func (e *ReservationApproved) Scan(src any) error {
	switch s := src.(type) {
	case []byte:
		*e = ReservationApproved(s)
	case string:
		*e = ReservationApproved(s)
	default:
		return fmt.Errorf("unsupported scan type for ReservationApproved: %T", src)
	}
	return nil
}

func (e ReservationApproved) String() string {
	return string(e)
}

type NullReservationApproved struct {
	ReservationApproved ReservationApproved `json:"reservation_approved"`
	Valid               bool                `json:"valid"` // Valid is true if ReservationApproved is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullReservationApproved) Scan(value any) error {
	if value == nil {
		ns.ReservationApproved, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.ReservationApproved.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullReservationApproved) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.ReservationApproved), nil
}

func AllReservationApprovedValues() []ReservationApproved {
	return []ReservationApproved{
		ReservationApprovedPending,
		ReservationApprovedApproved,
		ReservationApprovedDenied,
		ReservationApprovedCanceled,
	}
}

type ReservationDateApproved string

const (
	ReservationDateApprovedPending  ReservationDateApproved = "pending"
	ReservationDateApprovedApproved ReservationDateApproved = "approved"
	ReservationDateApprovedDenied   ReservationDateApproved = "denied"
	ReservationDateApprovedCanceled ReservationDateApproved = "canceled"
)

func (e *ReservationDateApproved) Scan(src any) error {
	switch s := src.(type) {
	case []byte:
		*e = ReservationDateApproved(s)
	case string:
		*e = ReservationDateApproved(s)
	default:
		return fmt.Errorf("unsupported scan type for ReservationDateApproved: %T", src)
	}
	return nil
}

func (e ReservationDateApproved) String() string {
	return string(e)
}

type NullReservationDateApproved struct {
	ReservationDateApproved ReservationDateApproved `json:"reservation_date_approved"`
	Valid                   bool                    `json:"valid"` // Valid is true if ReservationDateApproved is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullReservationDateApproved) Scan(value any) error {
	if value == nil {
		ns.ReservationDateApproved, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.ReservationDateApproved.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullReservationDateApproved) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.ReservationDateApproved), nil
}

func AllReservationDateApprovedValues() []ReservationDateApproved {
	return []ReservationDateApproved{
		ReservationDateApprovedPending,
		ReservationDateApprovedApproved,
		ReservationDateApprovedDenied,
		ReservationDateApprovedCanceled,
	}
}

type UserRole string

const (
	UserRoleUSER  UserRole = "USER"
	UserRoleADMIN UserRole = "ADMIN"
	UserRoleSTAFF UserRole = "STAFF"
	UserRoleGUEST UserRole = "GUEST"
)

func (u UserRole) String() string {
	return string(u)
}

func (e *UserRole) Scan(src any) error {
	switch s := src.(type) {
	case []byte:
		*e = UserRole(s)
	case string:
		*e = UserRole(s)
	default:
		return fmt.Errorf("unsupported scan type for UserRole: %T", src)
	}
	return nil
}

type NullUserRole struct {
	UserRole UserRole `json:"user_role"`
	Valid    bool     `json:"valid"` // Valid is true if UserRole is not NULL
}

// Scan implements the Scanner interface.
func (ns *NullUserRole) Scan(value any) error {
	if value == nil {
		ns.UserRole, ns.Valid = "", false
		return nil
	}
	ns.Valid = true
	return ns.UserRole.Scan(value)
}

// Value implements the driver Valuer interface.
func (ns NullUserRole) Value() (driver.Value, error) {
	if !ns.Valid {
		return nil, nil
	}
	return string(ns.UserRole), nil
}

func AllUserRoleValues() []UserRole {
	return []UserRole{
		UserRoleUSER,
		UserRoleADMIN,
		UserRoleSTAFF,
		UserRoleGUEST,
	}
}

type Category struct {
	ID          int64   `db:"id" json:"id"`
	Name        string  `db:"name" json:"name"`
	Description string  `db:"description" json:"description"`
	Price       float64 `db:"price" json:"price"`
	FacilityID  int64   `db:"facility_id" json:"facility_id"`
}

func ToCategory(category *pbFacilities.Category) Category {
	return Category{
		ID:          category.Id,
		Name:        category.Name,
		Description: category.Description,
		Price:       category.Price,
		FacilityID:  category.FacilityId,
	}
}

func ToCategories(categories []*pbFacilities.Category) []Category {
	var result []Category
	for _, category := range categories {
		result = append(result, ToCategory(category))
	}
	return result
}

func (c *Category) ToProto() *pbFacilities.Category {
	return &pbFacilities.Category{
		Id:          c.ID,
		Name:        c.Name,
		Description: c.Description,
		Price:       c.Price,
		FacilityId:  c.FacilityID,
	}
}

type Facility struct {
	ID               int64              `db:"id" json:"id"`
	Name             string             `db:"name" json:"name"`
	Building         string             `db:"building" json:"building"`
	Address          string             `db:"address" json:"address"`
	ImagePath        *string            `db:"image_path" json:"image_path"`
	Capacity         *int64             `db:"capacity" json:"capacity"`
	CreatedAt        pgtype.Timestamptz `db:"created_at" json:"created_at"`
	UpdatedAt        pgtype.Timestamptz `db:"updated_at" json:"updated_at"`
	GoogleCalendarID string             `db:"google_calendar_id" json:"google_calendar_id"`
}

func (f *Facility) ToProto() *pbFacilities.Facility {
	return &pbFacilities.Facility{
		Id:               f.ID,
		Name:             f.Name,
		Building:         f.Building,
		Address:          f.Address,
		ImagePath:        f.ImagePath,
		Capacity:         f.Capacity,
		CreatedAt:        utils.PgTimestamptzToString(f.CreatedAt),
		UpdatedAt:        utils.PgTimestamptzToString(f.UpdatedAt),
		GoogleCalendarId: f.GoogleCalendarID,
	}
}
func ToFacility(f *pbFacilities.Facility) *Facility {
	return &Facility{
		ID:               f.Id,
		Name:             f.Name,
		Building:         f.Building,
		Address:          f.Address,
		ImagePath:        f.ImagePath,
		Capacity:         f.Capacity,
		CreatedAt:        utils.StringToPgTimestamptz(f.CreatedAt),
		UpdatedAt:        utils.StringToPgTimestamptz(f.UpdatedAt),
		GoogleCalendarID: f.GoogleCalendarId,
	}
}

type FacilityWithCategories struct {
	Facility   Facility
	Categories []Category
}

func (f *FacilityWithCategories) ToProto() *pbFacilities.FacilityWithCategories {
	protoCategories := make([]*pbFacilities.Category, len(f.Categories))
	for i, category := range f.Categories {
		protoCategories[i] = category.ToProto()
	}
	return &pbFacilities.FacilityWithCategories{
		Facility:   f.Facility.ToProto(),
		Categories: protoCategories,
	}
}
func ToFacilityWithCategories(req *pbFacilities.FacilityWithCategories) *FacilityWithCategories {
	return &FacilityWithCategories{
		Facility:   *ToFacility(req.Facility),
		Categories: ToCategories(req.Categories),
	}
}

type FullFacility struct {
	Facility       *Facility
	Categories     []Category
	ReservationIDs []int64
}

func (f *FullFacility) ToProto() *pbFacilities.FullFacility {
	protoCategories := make([]*pbFacilities.Category, len(f.Categories))
	for i, category := range f.Categories {
		protoCategories[i] = category.ToProto()
	}
	return &pbFacilities.FullFacility{
		Facility:      f.Facility.ToProto(),
		Categories:    protoCategories,
		ReservationId: f.ReservationIDs,
	}
}

type InsuranceFile struct {
	ID            int64   `db:"id" json:"id"`
	FilePath      *string `db:"file_path" json:"file_path"`
	FileName      *string `db:"file_name" json:"file_name"`
	ReservationID int64   `db:"reservation_id" json:"reservation_id"`
	Varified      bool    `db:"varified" json:"varified"`
}

type Notification struct {
	ID         int64  `db:"id" json:"id"`
	FacilityID int64  `db:"facility_id" json:"facility_id"`
	Building   string `db:"building" json:"building"`
	UserID     string `db:"user_id" json:"user_id"`
}

type Reservation struct {
	ID             int64               `db:"id" json:"id"`
	UserID         string              `db:"user_id" json:"user_id"`
	EventName      string              `db:"event_name" json:"event_name"`
	FacilityID     int64               `db:"facility_id" json:"facility_id"`
	Approved       ReservationApproved `db:"approved" json:"approved"`
	CreatedAt      pgtype.Timestamptz  `db:"created_at" json:"created_at"`
	UpdatedAt      pgtype.Timestamptz  `db:"updated_at" json:"updated_at"`
	Details        *string             `db:"details" json:"details"`
	Fees           pgtype.Numeric      `db:"fees" json:"fees"`
	Insurance      bool                `db:"insurance" json:"insurance"`
	PrimaryContact *string             `db:"primary_contact" json:"primary_contact"`
	DoorAccess     *bool               `db:"door_access" json:"door_access"`
	DoorsDetails   *string             `db:"doors_details" json:"doors_details"`
	Name           *string             `db:"name" json:"name"`
	People         *string             `db:"people" json:"people"`
	TechDetails    *string             `db:"tech_details" json:"tech_details"`
	TechSupport    *bool               `db:"tech_support" json:"tech_support"`
	Phone          *string             `db:"phone" json:"phone"`
	CategoryID     int64               `db:"category_id" json:"category_id"`
	TotalHours     *float64            `db:"total_hours" json:"total_hours"`
	InPerson       bool                `db:"in_person" json:"in_person"`
	Paid           bool                `db:"paid" json:"paid"`
	PaymentUrl     *string             `db:"payment_url" json:"payment_url"`
	PaymentLinkID  *string             `db:"payment_link_id" json:"payment_link_id"`
	TicketMade     bool                `db:"ticket_made" json:"ticket_made"`
	Conflicts      bool                `db:"conflicts" json:"conflicts"`
	InsuranceLink  *string             `db:"insurance_link" json:"insurance_link"`
	CostOverride   pgtype.Numeric      `db:"cost_override" json:"cost_override"`
}

func (r *Reservation) ToProto() *pbReservation.Reservation {
	return &pbReservation.Reservation{
		Id:             r.ID,
		UserId:         r.UserID,
		EventName:      r.EventName,
		FacilityId:     r.FacilityID,
		Approved:       r.Approved.String(),
		CreatedAt:      utils.PgTimestamptzToString(r.CreatedAt),
		UpdatedAt:      utils.PgTimestamptzToString(r.UpdatedAt),
		Details:        r.Details,
		Fees:           utils.PgNumericToString(r.Fees),
		Insurance:      r.Insurance,
		PrimaryContact: r.PrimaryContact,
		DoorAccess:     r.DoorAccess,
		DoorsDetails:   r.DoorsDetails,
		Name:           r.Name,
		People:         r.People,
		TechDetails:    r.TechDetails,
		TechSupport:    r.TechSupport,
		Phone:          r.Phone,
		CategoryId:     r.CategoryID,
		TotalHours:     r.TotalHours,
		InPerson:       r.InPerson,
		Paid:           r.Paid,
		PaymentUrl:     r.PaymentUrl,
		PaymentLinkId:  r.PaymentLinkID,
		TicketMade:     r.TicketMade,
		Conflicts:      r.Conflicts,
		InsuranceLink:  r.InsuranceLink,
		CostOverride:   utils.PgNumericToString(r.CostOverride),
	}
}

func ToReservation(reservation *pbReservation.Reservation) *Reservation {
	return &Reservation{
		ID:             reservation.Id,
		UserID:         reservation.UserId,
		EventName:      reservation.EventName,
		FacilityID:     reservation.FacilityId,
		Approved:       ReservationApproved(reservation.Approved),
		CreatedAt:      utils.StringToPgTimestamptz(reservation.CreatedAt),
		UpdatedAt:      utils.StringToPgTimestamptz(reservation.UpdatedAt),
		Details:        reservation.Details,
		Fees:           utils.StringToPgNumeric(reservation.Fees),
		Insurance:      reservation.Insurance,
		PrimaryContact: reservation.PrimaryContact,
		DoorAccess:     reservation.DoorAccess,
		DoorsDetails:   reservation.DoorsDetails,
		Name:           reservation.Name,
		People:         reservation.People,
		TechDetails:    reservation.TechDetails,
		TechSupport:    reservation.TechSupport,
		Phone:          reservation.Phone,
		CategoryID:     reservation.CategoryId,
		TotalHours:     reservation.TotalHours,
		InPerson:       reservation.InPerson,
		Paid:           reservation.Paid,
		PaymentUrl:     reservation.PaymentUrl,
		PaymentLinkID:  reservation.PaymentLinkId,
		TicketMade:     reservation.TicketMade,
		Conflicts:      reservation.Conflicts,
		InsuranceLink:  reservation.InsuranceLink,
		CostOverride:   utils.StringToPgNumeric(reservation.CostOverride),
	}
}

type FullReservation struct {
	Reservation *Reservation
	Dates       []ReservationDate
	Fees        []ReservationFee
}

func (r *FullReservation) ToProto() *pbReservation.FullReservation {
	dates := make([]*pbReservation.ReservationDate, len(r.Dates))
	for i, date := range r.Dates {
		dates[i] = date.ToProto()
	}

	fees := make([]*pbReservation.ReservationFee, len(r.Fees))
	for i, fee := range r.Fees {
		fees[i] = fee.ToProto()
	}

	return &pbReservation.FullReservation{
		Reservation: r.Reservation.ToProto(),
		Dates:       dates,
		Fees:        fees,
	}
}

type ReservationDate struct {
	ID            int64                   `db:"id" json:"id"`
	StartDate     pgtype.Date             `db:"start_date" json:"start_date"`
	EndDate       pgtype.Date             `db:"end_date" json:"end_date"`
	StartTime     pgtype.Time             `db:"start_time" json:"start_time"`
	EndTime       pgtype.Time             `db:"end_time" json:"end_time"`
	ReservationID int64                   `db:"reservation_id" json:"reservation_id"`
	Approved      ReservationDateApproved `db:"approved" json:"approved"`
	GcalEventid   *string                 `db:"gcal_eventid" json:"gcal_eventid"`
}

func ToReservationDate(reservationDate *pbReservation.ReservationDate) *ReservationDate {
	return &ReservationDate{
		ID:            reservationDate.Id,
		StartDate:     utils.StringToPgDate(reservationDate.StartDate),
		EndDate:       utils.StringToPgDate(reservationDate.EndDate),
		StartTime:     utils.StringToPgTime(reservationDate.StartTime),
		EndTime:       utils.StringToPgTime(reservationDate.EndTime),
		ReservationID: reservationDate.ReservationId,
		Approved:      ReservationDateApproved(reservationDate.Approved),
		GcalEventid:   reservationDate.GcalEventid,
	}
}

func ToReservationDates(reservationDates []*pbReservation.ReservationDate) []ReservationDate {
	dates := make([]ReservationDate, len(reservationDates))
	for i, date := range reservationDates {
		dates[i] = *ToReservationDate(date)
	}
	return dates
}
func (r *ReservationDate) ToProto() *pbReservation.ReservationDate {
	return &pbReservation.ReservationDate{
		Id:            r.ID,
		StartDate:     utils.PgDateToString(r.StartDate),
		EndDate:       utils.PgDateToString(r.EndDate),
		StartTime:     utils.PgTimeToString(r.StartTime),
		EndTime:       utils.PgTimeToString(r.EndTime),
		ReservationId: r.ReservationID,
		Approved:      r.Approved.String(),
		GcalEventid:   r.GcalEventid,
	}
}

type ReservationFee struct {
	ID             int64          `db:"id" json:"id"`
	AdditionalFees pgtype.Numeric `db:"additional_fees" json:"additional_fees"`
	FeesType       *string        `db:"fees_type" json:"fees_type"`
	ReservationID  int64          `db:"reservation_id" json:"reservation_id"`
}

func ToReservationFee(reservationFee *pbReservation.ReservationFee) *ReservationFee {
	return &ReservationFee{
		ID:             reservationFee.Id,
		AdditionalFees: utils.StringToPgNumeric(reservationFee.AdditionalFees),
		FeesType:       reservationFee.FeesType,
		ReservationID:  reservationFee.ReservationId,
	}
}

func ToReservationFees(reservationFees []*pbReservation.ReservationFee) []ReservationFee {
	fees := make([]ReservationFee, len(reservationFees))
	for i, fee := range reservationFees {
		fees[i] = *ToReservationFee(fee)
	}
	return fees
}

func (r *ReservationFee) ToProto() *pbReservation.ReservationFee {
	return &pbReservation.ReservationFee{
		Id:             r.ID,
		AdditionalFees: utils.PgNumericToString(r.AdditionalFees),
		FeesType:       r.FeesType,
		ReservationId:  r.ReservationID,
	}
}

type Session struct {
	ID           string             `db:"id" json:"id"`
	UserID       string             `db:"user_id" json:"user_id"`
	RefreshToken *string            `db:"refresh_token" json:"refresh_token"`
	Provider     string             `db:"provider" json:"provider"`
	CreatedAt    pgtype.Timestamptz `db:"created_at" json:"created_at"`
	ExpiresAt    pgtype.Timestamptz `db:"expires_at" json:"expires_at"`
}

func (s *Session) ToProto() *pbSessions.Session {
	return &pbSessions.Session{
		Id:           s.ID,
		UserId:       s.UserID,
		RefreshToken: *s.RefreshToken,
		Provider:     s.Provider,
		CreatedAt:    utils.PgTimestamptzToString(s.CreatedAt),
		ExpiresAt:    utils.PgTimestamptzToString(s.ExpiresAt),
	}
}

type Users struct {
	ID            string             `db:"id" json:"id"`
	Name          string             `db:"name" json:"name"`
	Image         *string            `db:"image" json:"image"`
	Email         string             `db:"email" json:"email"`
	EmailVerified pgtype.Timestamptz `db:"email_verified" json:"email_verified"`
	Password      *string            `db:"password" json:"password,omitempty"`
	Provider      *string            `db:"provider" json:"provider"`
	ExternalUser  bool               `db:"external_user" json:"external_user"`
	Role          UserRole           `db:"role" json:"role"`
	CreatedAt     pgtype.Timestamptz `db:"created_at" json:"created_at"`
	Tos           bool               `db:"tos" json:"tos"`
}

func (u *Users) ToProto() *pbUsers.Users {
	return &pbUsers.Users{
		Id:            u.ID,
		Name:          u.Name,
		Image:         u.Image,
		Email:         u.Email,
		EmailVerified: utils.PgTimestamptzToString(u.EmailVerified),
		Password:      u.Password,
		Role:          u.Role.String(),
		Provider:      u.Provider,
		ExternalUser:  u.ExternalUser,
		Tos:           u.Tos,
	}
}

type VerificationToken struct {
	Identifier string             `db:"identifier" json:"identifier"`
	Token      string             `db:"token" json:"token"`
	Expires    pgtype.Timestamptz `db:"expires" json:"expires"`
}
