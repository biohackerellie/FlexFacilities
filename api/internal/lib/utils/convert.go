package utils

import (
	"math/big"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func PgTimestamptzToString(tz pgtype.Timestamptz) string {
	t, err := tz.Value()
	if err != nil {
		return ""
	}
	if t == nil {
		return ""
	}
	return t.(time.Time).Format(time.RFC3339)
}

func PgTimestamptzToTime(tz pgtype.Timestamptz) time.Time {
	t, err := tz.Value()
	if err != nil {
		return time.Time{}
	}
	if t == nil {
		return time.Time{}
	}
	return t.(time.Time)
}

func TimeToPgTimestamptz(t time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: t, Valid: true}
}

func PgDateToString(date pgtype.Date) string {
	t, err := date.Value()
	if err != nil {
		return ""
	}
	if t == nil {
		return ""
	}
	return t.(time.Time).Format("2006-01-02")
}

func StringToPgTimestamptz(s string) pgtype.Timestamptz {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: t, Valid: true}
}
func StringToPgTimestamp(s string) pgtype.Timestamp {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return pgtype.Timestamp{}
	}
	return pgtype.Timestamp{Time: t, Valid: true}
}
func PgTimestampToString(ts pgtype.Timestamp) string {
	t, err := ts.Value()
	if err != nil {
		return ""
	}
	if t == nil {
		return ""
	}
	return t.(time.Time).Format(time.RFC3339)
}

func StringToPgDate(s string) pgtype.Date {
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return pgtype.Date{}
	}
	return pgtype.Date{Time: t, Valid: true}
}

func DatesArrayToString(dates []time.Time) []string {
	strDates := make([]string, len(dates))
	for i, date := range dates {
		strDates[i] = date.String()
	}
	return strDates
}

func StringArrayToDates(strDates []string) []time.Time {
	dates := make([]time.Time, len(strDates))
	for i, strDate := range strDates {
		dates[i], _ = time.Parse(time.RFC3339, strDate)
	}
	return dates
}

func PgTimeToString(ti pgtype.Time) string {
	t, err := ti.Value()
	if err != nil {
		return ""
	}
	if t == nil {
		return ""
	}
	return t.(time.Time).Format("15:04")
}

func StringToPgTime(s string) pgtype.Time {
	t, err := time.Parse("15:04", s)
	if err != nil {
		return pgtype.Time{}
	}
	return pgtype.Time{Microseconds: t.UnixMicro(), Valid: true}
}

func PgTimeToTime(ti pgtype.Time) time.Time {
	t, err := ti.Value()
	if err != nil {
		return time.Time{}
	}
	if t == nil {
		return time.Time{}
	}
	return t.(time.Time)
}

func PgNumericToString(num pgtype.Numeric) string {
	var s string
	if num.Valid {
		s = num.Int.String()
	}
	return s
}

func StringToPgNumeric(s string) pgtype.Numeric {
	var num pgtype.Numeric
	if s == "" {
		num.Int = big.NewInt(0)
		num.Valid = false
		return num
	}
	// parse string to int64
	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return pgtype.Numeric{}
	}
	bigInt := big.NewInt(i)
	num.Int = bigInt
	num.Valid = true
	return num
}
func PGNumericToFloat64(num pgtype.Numeric) float64 {
	var f float64
	if num.Valid {
		f, _ = num.Int.Float64()
	}
	return f
}

func StringPtrToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
