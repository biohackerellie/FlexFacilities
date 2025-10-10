package handlers

import (
	"api/internal/models"
	"api/internal/ports"
	service "api/internal/proto/utility"
	"connectrpc.com/connect"
	"context"
	"log/slog"
	"time"
)

type UtilityHandler struct {
	log              *slog.Logger
	reservationStore ports.ReservationStore
	brandingStore    ports.BrandingStore
	loc              *time.Location
}

func NewUtilityHandler(reservationStore ports.ReservationStore, brandingStore ports.BrandingStore, log *slog.Logger, loc *time.Location) *UtilityHandler {
	log.With(slog.Group("Core_UtilityHandler", slog.String("name", "utility")))
	return &UtilityHandler{reservationStore: reservationStore, brandingStore: brandingStore, log: log, loc: loc}
}

func (u *UtilityHandler) AggregateChartData(ctx context.Context, req *connect.Request[service.AggregateChartDataRequest]) (*connect.Response[service.AggregateChartDataResponse], error) {
	rows, err := u.reservationStore.Aggregate(ctx)
	if err != nil {
		u.log.Error("Could not get aggregate", "error", err)
		return nil, err
	}
	now := time.Now()
	cur := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, u.loc)
	months := make([]time.Time, 0, 6)
	for i := 5; i >= 0; i-- {
		months = append(months, cur.AddDate(0, -i, 0))
	}
	data := make(map[time.Time]map[string]int)
	buildingSet := make(map[string]struct{})
	for _, r := range rows {
		month := time.Date(r.MonthStart.Year(), r.MonthStart.Month(), 1, 0, 0, 0, 0, u.loc)
		if data[month] == nil {
			data[month] = make(map[string]int)
		}
		data[month][r.BuildingName] = r.Count
		buildingSet[r.BuildingName] = struct{}{}
	}
	var chartData []*service.RPMDataEntry
	for _, m := range months {
		entry := &service.RPMDataEntry{
			Month:  m.Format("January"),
			Values: make(map[string]int32),
		}
		if inner, ok := data[m]; ok {
			for b, c := range inner {
				entry.Values[b] = int32(c)
			}
		}
		for b := range buildingSet {
			if _, ok := entry.Values[b]; !ok {
				entry.Values[b] = 0
			}
		}
		chartData = append(chartData, entry)
	}

	return connect.NewResponse(&service.AggregateChartDataResponse{
		Data: chartData,
	}), nil
}

func (u *UtilityHandler) GetBranding(ctx context.Context, req *connect.Request[service.GetBrandingRequest]) (*connect.Response[service.Branding], error) {
	data, err := u.brandingStore.Get(ctx)
	if err != nil {
		u.log.Error("Could not get branding", "error", err)
		return nil, err
	}
	if data == nil {
		return connect.NewResponse(&service.Branding{}), nil
	}
	return connect.NewResponse(data.ToProto()), nil
}

func (u *UtilityHandler) UpdateBranding(ctx context.Context, req *connect.Request[service.Branding]) (*connect.Response[service.UpdateBrandingResponse], error) {
	data := models.ToBranding(req.Msg)
	err := u.brandingStore.Update(ctx, data)
	if err != nil {
		u.log.Error("Could not update branding", "error", err)
		return nil, err
	}
	return connect.NewResponse(&service.UpdateBrandingResponse{}), nil

}
