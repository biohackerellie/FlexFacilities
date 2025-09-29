package handlers

import (
	"api/internal/models"
	"errors"

	"api/internal/ports"
	service "api/internal/proto/facilities"
	"api/pkg/calendar"
	"context"
	"log/slog"

	"connectrpc.com/connect"
)

type FacilityHandler struct {
	log           *slog.Logger
	calendar      *calendar.Calendar
	facilityStore ports.FacilityStore
}

func NewFacilityHandler(facilityStore ports.FacilityStore, log *slog.Logger, calendar *calendar.Calendar) *FacilityHandler {
	log.With(slog.Group("Core_Handler", slog.String("name", "facility")))
	return &FacilityHandler{facilityStore: facilityStore, log: log, calendar: calendar}
}

func (a *FacilityHandler) GetAllFacilities(ctx context.Context, req *connect.Request[service.GetAllFacilitiesRequest]) (*connect.Response[service.GetAllFacilitiesResponse], error) {
	facilities, err := a.facilityStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	protoFacilities := make([]*service.BuildingWithFacilities, len(facilities))
	for i, facility := range facilities {
		protoFacilities[i] = facility.ToProto()
	}

	return connect.NewResponse(&service.GetAllFacilitiesResponse{
		Buildings: protoFacilities,
	}), nil
}

func (a *FacilityHandler) GetAllBuildings(ctx context.Context, req *connect.Request[service.GetAllBuildingsRequest]) (*connect.Response[service.GetAllBuildingsResponse], error) {
	buildings, err := a.facilityStore.GetAllBuildings(ctx)
	if err != nil {
		return nil, err
	}
	protoBuildings := make([]*service.Building, len(buildings))
	for i, building := range buildings {
		protoBuildings[i] = building.ToProto()
	}

	return connect.NewResponse(&service.GetAllBuildingsResponse{
		Buildings: protoBuildings,
	}), nil
}

func (a *FacilityHandler) GetFacility(ctx context.Context, req *connect.Request[service.GetFacilityRequest]) (*connect.Response[service.FullFacility], error) {
	res, err := a.facilityStore.Get(ctx, req.Msg.GetId())

	if err != nil {
		return nil, err
	}
	facility := res.ToProto()
	return connect.NewResponse(&service.FullFacility{
		Facility:      facility.Facility,
		Categories:    facility.Categories,
		ReservationId: facility.ReservationId,
	}), nil
}
func (a *FacilityHandler) GetFacilityCategories(ctx context.Context, req *connect.Request[service.GetFacilityCategoriesRequest]) (*connect.Response[service.GetFacilityCategoriesResponse], error) {
	ids := []int64{req.Msg.GetId()}
	res, err := a.facilityStore.GetCategories(ctx, ids)

	if err != nil {
		return nil, err
	}
	categories := make([]*service.Category, len(res))
	for i, category := range res {
		categories[i] = category.ToProto()
	}
	return connect.NewResponse(&service.GetFacilityCategoriesResponse{
		Categories: categories,
	}), nil
}
func (a *FacilityHandler) GetBuildingFacilities(ctx context.Context, req *connect.Request[service.GetBuildingFacilitiesRequest]) (*connect.Response[service.GetBuildingFacilitiesResponse], error) {
	res, err := a.facilityStore.GetByBuilding(ctx, req.Msg.GetBuildingId())
	if err != nil {
		return nil, err
	}
	building := res.ToProto()
	return connect.NewResponse(&service.GetBuildingFacilitiesResponse{
		Building: building,
	}), nil
}
func (a *FacilityHandler) CreateFacility(ctx context.Context, req *connect.Request[service.CreateFacilityRequest]) (*connect.Response[service.CreateFacilityResponse], error) {
	facility := models.ToFacility(req.Msg.GetFacility())
	categories := models.ToCategories(req.Msg.GetCategories())

	err := a.facilityStore.Create(ctx, &models.FacilityWithCategories{
		Facility:   *facility,
		Categories: categories,
	})

	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.CreateFacilityResponse{}), nil

}
func (a *FacilityHandler) UpdateFacility(ctx context.Context, req *connect.Request[service.UpdateFacilityRequest]) (*connect.Response[service.UpdateFacilityResponse], error) {
	err := a.facilityStore.Update(ctx, models.ToFacility(req.Msg.GetFacility()))
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.UpdateFacilityResponse{}), nil

}
func (a *FacilityHandler) DeleteFacility(ctx context.Context, req *connect.Request[service.DeleteFacilityRequest]) (*connect.Response[service.DeleteFacilityResponse], error) {
	err := a.facilityStore.Delete(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteFacilityResponse{}), nil
}

func (a *FacilityHandler) UpdateFacilityCategory(ctx context.Context, req *connect.Request[service.UpdateFacilityCategoryRequest]) (*connect.Response[service.Category], error) {
	category := models.ToCategory(req.Msg.GetCategory())
	err := a.facilityStore.EditCategory(ctx, &category)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.Category{}), nil
}

func (a *FacilityHandler) GetAllEvents(ctx context.Context, req *connect.Request[service.GetAllEventsRequest]) (*connect.Response[service.GetAllEventsResponse], error) {
	buildings, err := a.facilityStore.GetAllBuildings(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]*service.BuildingWithEvents, len(buildings))
	for i, building := range buildings {
		calId := building.GoogleCalendarID
		if calId == nil || *calId == "" {
			continue
		}
		res, err := a.calendar.ListEvents(*calId)
		if err != nil {
			return nil, err
		}
		events := make([]*service.Event, len(res.Items))
		for i, event := range res.Items {
			events[i] = &service.Event{
				Summary:     event.Summary,
				Start:       event.Start.DateTime,
				End:         event.End.DateTime,
				Location:    event.Location,
				Description: event.Description,
				Title:       event.Summary,
			}
		}
		result[i] = &service.BuildingWithEvents{
			Building: building.ToProto(),
			Events:   events,
		}
	}

	return connect.NewResponse(&service.GetAllEventsResponse{
		Data: result,
	}), nil
}

func (a *FacilityHandler) GetEventsByFacility(ctx context.Context, req *connect.Request[service.GetEventsByFacilityRequest]) (*connect.Response[service.GetEventsByFacilityResponse], error) {
	fac, err := a.facilityStore.Get(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}

	res, err := a.calendar.ListEvents(fac.Facility.GoogleCalendarID)
	if err != nil {
		return nil, err
	}
	events := make([]*service.Event, len(res.Items))
	for i, event := range res.Items {
		events[i] = &service.Event{
			Summary:     event.Summary,
			Start:       event.Start.DateTime,
			End:         event.End.DateTime,
			Location:    event.Location,
			Description: event.Description,
			Title:       event.Summary,
		}
	}
	return connect.NewResponse(&service.GetEventsByFacilityResponse{
		Events: events,
	}), nil
}

func (a *FacilityHandler) GetEventsByBuilding(ctx context.Context, req *connect.Request[service.GetEventsByBuildingRequest]) (*connect.Response[service.GetEventsByBuildingResponse], error) {
	building, err := a.facilityStore.GetBuilding(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	calendarID := building.GoogleCalendarID
	if calendarID == nil {
		return nil, errors.New("building has no calendar")
	}
	res, err := a.calendar.ListEvents(*calendarID)
	if err != nil {
		return nil, err
	}
	events := make([]*service.Event, len(res.Items))
	for i, event := range res.Items {
		events[i] = &service.Event{
			Summary:     event.Summary,
			Start:       event.Start.DateTime,
			End:         event.End.DateTime,
			Location:    event.Location,
			Description: event.Description,
			Title:       event.Summary,
		}
	}
	return connect.NewResponse(&service.GetEventsByBuildingResponse{
		Events: events,
	}), nil
}

func (a *FacilityHandler) GetCategory(ctx context.Context, req *connect.Request[service.GetCategoryRequest]) (*connect.Response[service.Category], error) {
	category, err := a.facilityStore.GetCategory(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(category.ToProto()), nil
}
