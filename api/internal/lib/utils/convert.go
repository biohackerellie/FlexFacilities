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

func StringToPgTimestamptz(s string) pgtype.Timestamptz {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: t, Valid: true}
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
