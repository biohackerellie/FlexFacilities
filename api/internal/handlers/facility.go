package handlers

import (
	"api/internal/models"
	"api/internal/ports"
	service "api/internal/proto/facilities"
	"connectrpc.com/connect"
	"context"
	"log/slog"
)

type FacilityHandler struct {
	log *slog.Logger

	facilityStore ports.FacilityStore
}

func NewFacilityHandler(facilityStore ports.FacilityStore, log *slog.Logger) *FacilityHandler {
	log.With(slog.Group("Core_Handler", slog.String("name", "facility")))
	return &FacilityHandler{facilityStore: facilityStore, log: log}
}

func (a *FacilityHandler) GetAllFacilities(ctx context.Context, req *connect.Request[service.GetAllFacilitiesRequest]) (*connect.Response[service.GetAllFacilitiesResponse], error) {
	facilities, err := a.facilityStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	protoFacilities := make([]*service.FacilityWithCategories, len(facilities))
	for i, facility := range facilities {
		protoFacilities[i] = facility.ToProto()
	}

	return connect.NewResponse(&service.GetAllFacilitiesResponse{
		Facilities: protoFacilities,
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
	res, err := a.facilityStore.GetByBuilding(ctx, req.Msg.GetBuilding())
	if err != nil {
		return nil, err
	}
	facilities := make([]*service.FacilityWithCategories, len(res))
	for i, facility := range res {
		facilities[i] = facility.ToProto()
	}
	return connect.NewResponse(&service.GetBuildingFacilitiesResponse{
		Facilities: facilities,
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
