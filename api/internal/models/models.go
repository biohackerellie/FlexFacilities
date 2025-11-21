package models

import (
	"api/internal/lib/utils"
	pbSessions "api/internal/proto/auth"
	pbFacilities "api/internal/proto/facilities"
	pbReservation "api/internal/proto/reservation"
	pbUsers "api/internal/proto/users"
	pbUtility "api/internal/proto/utility"
	"database/sql"
	"database/sql/driver"
	"fmt"
	"time"

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
	ID          int64  `db:"id" json:"id"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
	// Price       float64 `db:"price" json:"price"`
	// FacilityID  int64   `db:"facility_id" json:"facility_id"`
}

func ToCategory(category *pbFacilities.Category) Category {
	return Category{
		ID:          category.Id,
		Name:        category.Name,
		Description: category.Description,
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
	}
}

func ToProtoCategories(categories []Category) []*pbFacilities.Category {
	var result []*pbFacilities.Category
	for _, category := range categories {
		result = append(result, category.ToProto())
	}
	return result
}

type Pricing struct {
	ID         string  `db:"id" json:"id"`
	ProductID  string  `db:"product_id" json:"product_id"`
	Price      float64 `db:"-" json:"price"`
	CategoryID int64   `db:"category_id" json:"category_id"`
	UnitLabel  string  `db:"unit_label" json:"unit_label"`
}

func (p *Pricing) ToProto() *pbFacilities.Pricing {
	return &pbFacilities.Pricing{
		Id:         p.ID,
		ProductId:  p.ProductID,
		Price:      p.Price,
		CategoryId: p.CategoryID,
		UnitLabel:  p.UnitLabel,
	}
}

func ToPricing(pricing *pbFacilities.Pricing) *Pricing {
	return &Pricing{
		ID:         pricing.Id,
		ProductID:  pricing.ProductId,
		Price:      pricing.Price,
		CategoryID: pricing.CategoryId,
		UnitLabel:  pricing.UnitLabel,
	}
}

type Building struct {
	ID               int64           `db:"id" json:"id"`
	Name             string          `db:"name" json:"name"`
	Address          string          `db:"address" json:"address"`
	ImagePath        sql.NullString  `db:"image_path" json:"image_path"`
	GoogleCalendarID sql.NullString  `db:"google_calendar_id" json:"google_calendar_id"`
	Latitude         sql.NullFloat64 `db:"latitude" json:"latitude"`
	Longitude        sql.NullFloat64 `db:"longitude" json:"longitude"`
}

func (b *Building) ToProto() *pbFacilities.Building {
	return &pbFacilities.Building{
		Id:               b.ID,
		Name:             b.Name,
		Address:          b.Address,
		ImagePath:        b.ImagePath.String,
		GoogleCalendarId: b.GoogleCalendarID.String,
		Latitude:         b.Latitude.Float64,
		Longitude:        b.Longitude.Float64,
	}
}

func CheckValid(value any) bool {
	if value == nil {
		return false
	}
	switch s := value.(type) {
	case []byte:
		return len(s) > 0
	case string:
		return len(s) > 0
	case float64, int64, int32, int:
		return true
	default:
		return false
	}
}

func CheckNullString(value any) sql.NullString {
	if value == nil {
		return sql.NullString{String: "", Valid: false}
	}
	switch s := value.(type) {
	case []byte:
		return sql.NullString{String: string(s), Valid: CheckValid(s)}
	case string:
		return sql.NullString{String: s, Valid: CheckValid(s)}
	case float64, int64, int32, int:
		return sql.NullString{String: fmt.Sprintf("%v", s), Valid: true}
	default:
		return sql.NullString{String: "", Valid: false}
	}
}

func CheckNullByte(value []byte) []sql.NullByte {
	var result []sql.NullByte
	if len(value) == 0 {
		return result
	}
	for _, v := range value {
		result = append(result, sql.NullByte{Byte: v, Valid: true})
	}
	return result
}

func CheckNullFloat64(value any) sql.NullFloat64 {
	if value == nil {
		return sql.NullFloat64{Float64: 0, Valid: false}
	}
	switch s := value.(type) {
	case []byte:
		return sql.NullFloat64{Float64: utils.StringToFloat64(string(s)), Valid: CheckValid(s)}
	case string:
		return sql.NullFloat64{Float64: utils.StringToFloat64(s), Valid: CheckValid(s)}
	case float64, int64, int32, int:
		return sql.NullFloat64{Float64: utils.StringToFloat64(fmt.Sprintf("%v", s)), Valid: true}
	default:
		return sql.NullFloat64{Float64: 0, Valid: false}
	}
}

func CheckNullInt64(value any) sql.NullInt64 {
	if value == nil {
		return sql.NullInt64{Int64: 0, Valid: false}
	}
	switch s := value.(type) {
	case []byte:
		return sql.NullInt64{Int64: utils.StringToInt64(string(s)), Valid: CheckValid(s)}
	case string:
		return sql.NullInt64{Int64: utils.StringToInt64(s), Valid: CheckValid(s)}
	case float64, int64, int32, int:
		return sql.NullInt64{Int64: utils.StringToInt64(fmt.Sprintf("%v", s)), Valid: true}
	default:
		return sql.NullInt64{Int64: 0, Valid: false}
	}
}

func ToBuilding(building *pbFacilities.Building) Building {
	return Building{
		ID:               building.Id,
		Name:             building.Name,
		Address:          building.Address,
		ImagePath:        sql.NullString{String: building.ImagePath, Valid: CheckValid(building.ImagePath)},               //building.ImagePath,
		GoogleCalendarID: sql.NullString{String: building.GoogleCalendarId, Valid: CheckValid(building.GoogleCalendarId)}, //building.GoogleCalendarId,
		Latitude:         sql.NullFloat64{Float64: building.Latitude, Valid: CheckValid(building.Latitude)},               //building.Latitude,
		Longitude:        sql.NullFloat64{Float64: building.Longitude, Valid: CheckValid(building.Longitude)},             //building.Longitude,
	}
}

type BuildingWithFacilities struct {
	Building
	Facilities []Facility `json:"facilities"`
	Categories []Category `json:"categories"`
}
type BuildingCoords struct {
	ID        int64   `db:"id" json:"id"`
	Name      string  `db:"name" json:"name"`
	Latitude  float64 `db:"latitude" json:"latitude"`
	Longitude float64 `db:"longitude" json:"longitude"`
}

func (b *BuildingCoords) ToProto() *pbFacilities.Coords {
	return &pbFacilities.Coords{
		Id:        b.ID,
		Building:  b.Name,
		Latitude:  b.Latitude,
		Longitude: b.Longitude,
	}
}

func CoordsToProto(buildingCoords []BuildingCoords) []*pbFacilities.Coords {
	result := make([]*pbFacilities.Coords, 0, len(buildingCoords))
	for _, buildingCoord := range buildingCoords {
		result = append(result, buildingCoord.ToProto())
	}
	return result
}

func (b *BuildingWithFacilities) ToProto() *pbFacilities.BuildingWithFacilities {
	facilities := make([]*pbFacilities.Facility, 0, len(b.Facilities))
	for _, f := range b.Facilities {
		facilities = append(facilities, f.ToProto())
	}
	return &pbFacilities.BuildingWithFacilities{
		Building:   b.Building.ToProto(),
		Facilities: facilities,
	}
}

type Facility struct {
	ID               int64              `db:"id" json:"id"`
	Name             string             `db:"name" json:"name"`
	ImagePath        sql.NullString     `db:"image_path" json:"image_path"`
	Capacity         sql.NullInt64      `db:"capacity" json:"capacity"`
	CreatedAt        pgtype.Timestamptz `db:"created_at" json:"created_at"`
	UpdatedAt        pgtype.Timestamptz `db:"updated_at" json:"updated_at"`
	GoogleCalendarID string             `db:"google_calendar_id" json:"google_calendar_id"`
	BuildingID       int64              `db:"building_id" json:"building_id"`
	ProductID        sql.NullString     `db:"product_id" json:"product_id"`
}

func (f *Facility) ToProto() *pbFacilities.Facility {
	return &pbFacilities.Facility{
		Id:               f.ID,
		Name:             f.Name,
		ImagePath:        f.ImagePath.String,
		Capacity:         f.Capacity.Int64,
		CreatedAt:        utils.PgTimestamptzToString(f.CreatedAt),
		UpdatedAt:        utils.PgTimestamptzToString(f.UpdatedAt),
		GoogleCalendarId: f.GoogleCalendarID,
		BuildingId:       f.BuildingID,
	}
}
func ToFacility(f *pbFacilities.Facility) *Facility {
	return &Facility{
		ID:               f.Id,
		Name:             f.Name,
		ImagePath:        sql.NullString{String: f.ImagePath, Valid: CheckValid(f.ImagePath)}, //f.ImagePath,
		Capacity:         sql.NullInt64{Int64: f.Capacity, Valid: CheckValid(f.Capacity)},     //f.Capacity,
		CreatedAt:        utils.StringToPgTimestamptz(f.CreatedAt),
		UpdatedAt:        utils.StringToPgTimestamptz(f.UpdatedAt),
		GoogleCalendarID: f.GoogleCalendarId,
		BuildingID:       f.BuildingId,
	}
}

type PricingWithCategory struct {
	Pricing
	CategoryName        string
	CategoryDescription string
}

func (p *PricingWithCategory) ToProto() *pbFacilities.PricingWithCategory {
	return &pbFacilities.PricingWithCategory{
		Id:                  p.ID,
		ProductId:           p.ProductID,
		Price:               p.Price,
		CategoryId:          p.CategoryID,
		UnitLabel:           p.UnitLabel,
		CategoryName:        p.CategoryName,
		CategoryDescription: p.CategoryDescription,
	}
}
func ToPricingWithCategory(req *pbFacilities.PricingWithCategory) *PricingWithCategory {
	return &PricingWithCategory{
		Pricing: Pricing{
			ID:         req.Id,
			ProductID:  req.ProductId,
			Price:      req.Price,
			CategoryID: req.CategoryId,
			UnitLabel:  req.UnitLabel,
		},
		CategoryName:        req.CategoryName,
		CategoryDescription: req.CategoryDescription,
	}
}

type FullFacility struct {
	Facility       *Facility
	Building       *Building
	Pricing        []PricingWithCategory
	ReservationIDs []int64
}

func (f *FullFacility) ToProto() *pbFacilities.FullFacility {
	protoPricing := make([]*pbFacilities.PricingWithCategory, len(f.Pricing))
	for i, pricing := range f.Pricing {
		protoPricing[i] = pricing.ToProto()
	}
	return &pbFacilities.FullFacility{
		Facility:      f.Facility.ToProto(),
		Pricing:       protoPricing,
		ReservationId: f.ReservationIDs,
		Building:      f.Building.ToProto(),
	}
}

// type InsuranceFile struct {
// 	ID            int64   `db:"id" json:"id"`
// 	FilePath      string `db:"file_path" json:"file_path"`
// 	FileName      string `db:"file_name" json:"file_name"`
// 	ReservationID int64   `db:"reservation_id" json:"reservation_id"`
// 	Varified      bool    `db:"varified" json:"varified"`
// }

type Notification struct {
	ID         int64  `db:"id" json:"id"`
	BuildingID int64  `db:"building_id" json:"building_id"`
	UserID     string `db:"user_id" json:"user_id"`
}

func (n *Notification) ToProto() *pbUsers.Notifications {
	return &pbUsers.Notifications{
		Id:         n.ID,
		BuildingId: n.BuildingID,
		UserId:     n.UserID,
	}
}
func NotificationsToProto(n []*Notification) []*pbUsers.Notifications {
	protoNotifications := make([]*pbUsers.Notifications, len(n))
	for i, notification := range n {
		protoNotifications[i] = notification.ToProto()
	}
	return protoNotifications
}
func ToNotification(n *pbUsers.Notifications) *Notification {
	return &Notification{
		ID:         n.Id,
		BuildingID: n.BuildingId,
		UserID:     n.UserId,
	}
}

type NotificationReadable struct {
	ID           int64  `db:"id" json:"id"`
	BuildingID   int64  `db:"building_id" json:"building_id"`
	BuildingName string `db:"building_name" json:"building_name"`
	UserID       string `db:"user_id" json:"user_id"`
	UserName     string `db:"user_name" json:"user_name"`
}

func (n *NotificationReadable) ToProto() *pbUsers.NotificationsReadable {
	return &pbUsers.NotificationsReadable{
		Id:           n.ID,
		BuildingId:   n.BuildingID,
		BuildingName: n.BuildingName,
		UserId:       n.UserID,
		UserName:     n.UserName,
	}
}
func NotificationsReadableToProto(n []*NotificationReadable) []*pbUsers.NotificationsReadable {
	protoNotifications := make([]*pbUsers.NotificationsReadable, len(n))
	for i, notification := range n {
		protoNotifications[i] = notification.ToProto()
	}
	return protoNotifications
}

type Reservation struct {
	ID            int64               `db:"id" json:"id"`
	UserID        string              `db:"user_id" json:"user_id"`
	EventName     string              `db:"event_name" json:"event_name"`
	FacilityID    int64               `db:"facility_id" json:"facility_id"`
	Approved      ReservationApproved `db:"approved" json:"approved"`
	CreatedAt     pgtype.Timestamptz  `db:"created_at" json:"created_at"`
	UpdatedAt     pgtype.Timestamptz  `db:"updated_at" json:"updated_at"`
	Details       sql.NullString      `db:"details" json:"details"`
	Fees          pgtype.Numeric      `db:"fees" json:"fees"`
	Insurance     bool                `db:"insurance" json:"insurance"`
	DoorAccess    bool                `db:"door_access" json:"door_access"`
	DoorsDetails  sql.NullString      `db:"doors_details" json:"doors_details"`
	Name          string              `db:"name" json:"name"`
	TechDetails   sql.NullString      `db:"tech_details" json:"tech_details"`
	TechSupport   bool                `db:"tech_support" json:"tech_support"`
	Phone         sql.NullString      `db:"phone" json:"phone"`
	CategoryID    int64               `db:"category_id" json:"category_id"`
	TotalHours    sql.NullFloat64     `db:"total_hours" json:"total_hours"`
	InPerson      bool                `db:"in_person" json:"in_person"`
	Paid          bool                `db:"paid" json:"paid"`
	PaymentUrl    sql.NullString      `db:"payment_url" json:"payment_url"`
	PaymentLinkID sql.NullString      `db:"payment_link_id" json:"payment_link_id"`
	InsuranceLink sql.NullString      `db:"insurance_link" json:"insurance_link"`
	CostOverride  pgtype.Numeric      `db:"cost_override" json:"cost_override"`
	RRule         sql.NullString      `db:"rrule" json:"rrule"`
	RDates        []sql.NullTime      `db:"rdates" json:"rdates"`
	EXDates       []sql.NullTime      `db:"exdates" json:"exdates"`
	GCalEventID   sql.NullString      `db:"gcal_eventid" json:"gcal_eventid"`
	PriceID       sql.NullString      `db:"price_id" json:"price_id"`
}

func (r *Reservation) ToProto() *pbReservation.Reservation {
	rdates := make([]string, 0)
	if len(r.RDates) > 0 {
		for _, date := range r.RDates {
			if date.Valid {
				rdates = append(rdates, date.Time.String())
			}
		}
	}

	exdates := make([]string, 0)
	if len(r.EXDates) > 0 {
		for _, date := range r.EXDates {
			if date.Valid {
				exdates = append(exdates, date.Time.String())
			}
		}
	}
	return &pbReservation.Reservation{
		Id:            r.ID,
		UserId:        r.UserID,
		EventName:     r.EventName,
		FacilityId:    r.FacilityID,
		Approved:      r.Approved.String(),
		CreatedAt:     utils.PgTimestamptzToString(r.CreatedAt),
		UpdatedAt:     utils.PgTimestamptzToString(r.UpdatedAt),
		Details:       r.Details.String,
		Fees:          utils.PgNumericToString(r.Fees),
		Insurance:     r.Insurance,
		DoorAccess:    r.DoorAccess,
		DoorsDetails:  r.DoorsDetails.String,
		Name:          r.Name,
		TechDetails:   r.TechDetails.String,
		TechSupport:   r.TechSupport,
		Phone:         r.Phone.String,
		CategoryId:    r.CategoryID,
		TotalHours:    r.TotalHours.Float64,
		InPerson:      r.InPerson,
		Paid:          r.Paid,
		PaymentUrl:    r.PaymentUrl.String,
		PaymentLinkId: r.PaymentLinkID.String,
		InsuranceLink: r.InsuranceLink.String,
		CostOverride:  utils.PgNumericToString(r.CostOverride),
		Rrule:         r.RRule.String,
		Rdates:        rdates,
		Exdates:       exdates,
		GcalEventid:   r.GCalEventID.String,
		PriceId:       r.PriceID.String,
	}
}

const RFC5545 = "20060102T150405Z"

func StringArrayToNullDates(d []string) []sql.NullTime {
	dates := make([]sql.NullTime, 0, len(d))
	if len(d) > 0 {
		for _, date := range d {
			var v bool
			t, err := time.Parse(time.RFC3339, date)
			if err != nil {
				v = false
				t = time.Time{}
			}
			dates = append(dates, sql.NullTime{Time: t, Valid: v})
		}
	}
	return dates
}

func DatesArrayToNullDates(d []time.Time) []sql.NullTime {
	dates := make([]sql.NullTime, 0, len(d))
	if len(d) > 0 {
		for _, date := range d {
			dates = append(dates, sql.NullTime{Time: date, Valid: true})
		}
	}
	return dates
}

func ToReservation(reservation *pbReservation.Reservation) *Reservation {
	rdates := StringArrayToNullDates(reservation.Rdates)
	exdates := StringArrayToNullDates(reservation.Exdates)
	return &Reservation{
		ID:            reservation.Id,
		UserID:        reservation.UserId,
		EventName:     reservation.EventName,
		FacilityID:    reservation.FacilityId,
		Approved:      ReservationApproved(reservation.Approved),
		CreatedAt:     utils.StringToPgTimestamptz(reservation.CreatedAt),
		UpdatedAt:     utils.StringToPgTimestamptz(reservation.UpdatedAt),
		Details:       CheckNullString(reservation.Details),
		Fees:          utils.StringToPgNumeric(reservation.Fees),
		Insurance:     reservation.Insurance,
		DoorAccess:    reservation.DoorAccess,
		DoorsDetails:  CheckNullString(reservation.DoorsDetails),
		Name:          reservation.Name,
		TechDetails:   CheckNullString(reservation.TechDetails),
		TechSupport:   reservation.TechSupport,
		Phone:         CheckNullString(reservation.Phone), //reservation.Phone,
		CategoryID:    reservation.CategoryId,
		TotalHours:    CheckNullFloat64(reservation.TotalHours),
		InPerson:      reservation.InPerson,
		Paid:          reservation.Paid,
		PaymentUrl:    CheckNullString(reservation.PaymentUrl),
		PaymentLinkID: CheckNullString(reservation.PaymentLinkId),
		InsuranceLink: CheckNullString(reservation.InsuranceLink), //reservation.InsuranceLink,
		CostOverride:  utils.StringToPgNumeric(reservation.CostOverride),
		RRule:         CheckNullString(reservation.Rrule), //reservation.Rrule,
		RDates:        rdates,
		EXDates:       exdates,
		GCalEventID:   CheckNullString(reservation.GcalEventid),
		PriceID:       CheckNullString(reservation.PriceId),
	}
}

type FullReservation struct {
	Reservation Reservation
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
	ReservationID int64                   `db:"reservation_id" json:"reservation_id"`
	Approved      ReservationDateApproved `db:"approved" json:"approved"`
	GcalEventid   sql.NullString          `db:"gcal_eventid" json:"gcal_eventid"`
	LocalStart    pgtype.Timestamp        `db:"local_start" json:"local_start"`
	LocalEnd      pgtype.Timestamp        `db:"local_end" json:"local_end"`
}

func ToReservationDate(reservationDate *pbReservation.ReservationDate) *ReservationDate {
	return &ReservationDate{
		ID:            reservationDate.Id,
		ReservationID: reservationDate.ReservationId,
		Approved:      ReservationDateApproved(reservationDate.Approved),
		GcalEventid:   CheckNullString(reservationDate.GcalEventid), //reservationDate.GcalEventid,
		LocalStart:    utils.StringToPgTimestamp(reservationDate.LocalStart),
		LocalEnd:      utils.StringToPgTimestamp(reservationDate.LocalEnd),
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
		ReservationId: r.ReservationID,
		Approved:      r.Approved.String(),
		GcalEventid:   r.GcalEventid.String,
		LocalStart:    utils.PgTimestampToString(r.LocalStart),
		LocalEnd:      utils.PgTimestampToString(r.LocalEnd),
	}
}

type ReservationFee struct {
	ID             int64          `db:"id" json:"id"`
	AdditionalFees pgtype.Numeric `db:"additional_fees" json:"additional_fees"`
	FeesType       sql.NullString `db:"fees_type" json:"fees_type"`
	ReservationID  int64          `db:"reservation_id" json:"reservation_id"`
}

func ToReservationFee(reservationFee *pbReservation.ReservationFee) *ReservationFee {
	return &ReservationFee{
		ID:             reservationFee.Id,
		AdditionalFees: utils.StringToPgNumeric(reservationFee.AdditionalFees),
		FeesType:       CheckNullString(reservationFee.FeesType), //reservationFee.FeesType,
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
		FeesType:       r.FeesType.String,
		ReservationId:  r.ReservationID,
	}
}

type Session struct {
	ID           string             `db:"id" json:"id"`
	UserID       string             `db:"user_id" json:"user_id"`
	RefreshToken sql.NullString     `db:"refresh_token" json:"refresh_token"`
	Provider     string             `db:"provider" json:"provider"`
	CreatedAt    pgtype.Timestamptz `db:"created_at" json:"created_at"`
	ExpiresAt    pgtype.Timestamptz `db:"expires_at" json:"expires_at"`
}

func (s *Session) ToProto() *pbSessions.Session {
	return &pbSessions.Session{
		Id:           s.ID,
		UserId:       s.UserID,
		RefreshToken: s.RefreshToken.String,
		Provider:     s.Provider,
		CreatedAt:    utils.PgTimestamptzToString(s.CreatedAt),
		ExpiresAt:    utils.PgTimestamptzToString(s.ExpiresAt),
	}
}

type Users struct {
	ID            string             `db:"id" json:"id"`
	Name          string             `db:"name" json:"name"`
	Image         sql.NullString     `db:"image" json:"image"`
	Email         string             `db:"email" json:"email"`
	EmailVerified pgtype.Timestamptz `db:"email_verified" json:"email_verified"`
	Password      *[]byte            `db:"password" json:"-"`
	Provider      string             `db:"provider" json:"provider"`
	ExternalUser  bool               `db:"external_user" json:"external_user"`
	Role          UserRole           `db:"role" json:"role"`
	CreatedAt     pgtype.Timestamptz `db:"created_at" json:"created_at"`
	Tos           bool               `db:"tos" json:"tos"`
}

func ToUser(user *pbUsers.Users) *Users {
	return &Users{
		ID:            user.Id,
		Name:          user.Name,
		Image:         CheckNullString(user.Image), //user.Image,
		Email:         user.Email,
		EmailVerified: utils.StringToPgTimestamptz(user.EmailVerified),
		Role:          UserRole(user.Role),
		Provider:      user.Provider,
		ExternalUser:  user.ExternalUser,
		Tos:           user.Tos,
	}
}

func (u *Users) ToProto() *pbUsers.Users {
	return &pbUsers.Users{
		Id:            u.ID,
		Name:          u.Name,
		Image:         u.Image.String,
		Email:         u.Email,
		EmailVerified: utils.PgTimestamptzToString(u.EmailVerified),
		Role:          u.Role.String(),
		Provider:      u.Provider,
		ExternalUser:  u.ExternalUser,
		Tos:           u.Tos,
	}
}

func UsersToProto(users []*Users) []*pbUsers.Users {
	protoUsers := make([]*pbUsers.Users, len(users))
	for i, user := range users {
		protoUsers[i] = user.ToProto()
	}
	return protoUsers

}

type VerificationToken struct {
	Identifier string             `db:"identifier" json:"identifier"`
	Token      string             `db:"token" json:"token"`
	Expires    pgtype.Timestamptz `db:"expires" json:"expires"`
}

type Aggregate struct {
	MonthStart   time.Time `db:"month_start"`
	BuildingName string    `db:"building_name"`
	Count        int       `db:"count"`
}

type Branding struct {
	ID                         int64          `db:"id" json:"id"`
	OrganizationName           string         `db:"organization_name" json:"organization_name"`
	OrganizationLogoPath       string         `db:"organization_logo_path" json:"organization_logo_path"`
	OrganizationPrimaryColor   sql.NullString `db:"organization_primary_color" json:"organization_primary_color"`
	OrganizationSecondaryColor sql.NullString `db:"organization_secondary_color" json:"organization_secondary_color"`
	OrganizationUrl            sql.NullString `db:"organization_url" json:"organization_url"`
	OrganizationDescription    sql.NullString `db:"organization_description" json:"organization_description"`
	OrganizationEmail          sql.NullString `db:"organization_email" json:"organization_email"`
}

func (b *Branding) ToProto() *pbUtility.Branding {
	return &pbUtility.Branding{
		Id:                         b.ID,
		OrganizationName:           b.OrganizationName,
		OrganizationLogoPath:       b.OrganizationLogoPath,
		OrganizationPrimaryColor:   b.OrganizationPrimaryColor.String,
		OrganizationSecondaryColor: b.OrganizationSecondaryColor.String,
		OrganizationUrl:            b.OrganizationUrl.String,
		OrganizationDescription:    b.OrganizationDescription.String,
		OrganizationEmail:          b.OrganizationEmail.String,
	}
}

func ToBranding(br *pbUtility.Branding) *Branding {
	return &Branding{
		ID:                         br.Id,
		OrganizationName:           br.OrganizationName,
		OrganizationLogoPath:       br.OrganizationLogoPath,
		OrganizationPrimaryColor:   CheckNullString(br.OrganizationPrimaryColor),
		OrganizationSecondaryColor: CheckNullString(br.OrganizationSecondaryColor),
		OrganizationUrl:            CheckNullString(br.OrganizationUrl),
		OrganizationDescription:    CheckNullString(br.OrganizationDescription),
		OrganizationEmail:          CheckNullString(br.OrganizationEmail),
	}
}
