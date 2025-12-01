package handlers

import (
	"api/internal/models"
	"sort"

	"api/internal/ports"
	service "api/internal/proto/facilities"
	"api/pkg/calendar"
	"context"
	"log/slog"

	"connectrpc.com/connect"
	"github.com/stripe/stripe-go/v83"
)

type FacilityHandler struct {
	log           *slog.Logger
	calendar      *calendar.Calendar
	facilityStore ports.FacilityStore

	sc *stripe.Client
}

func NewFacilityHandler(facilityStore ports.FacilityStore, log *slog.Logger, calendar *calendar.Calendar, sc *stripe.Client) *FacilityHandler {
	log.With(slog.Group("Core_Handler", slog.String("name", "facility")))
	return &FacilityHandler{facilityStore: facilityStore, log: log, calendar: calendar, sc: sc}
}

func (a *FacilityHandler) GetAllFacilities(ctx context.Context, req *connect.Request[service.GetAllFacilitiesRequest]) (*connect.Response[service.GetAllFacilitiesResponse], error) {
	facilities, err := a.facilityStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	protoFacilities := make([]*service.BuildingWithFacilities, len(facilities))
	for i, facility := range facilities {
		a.log.Debug("GetAllFacilities", "facility", len(facility.Facilities))
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
	if res == nil {
		return connect.NewResponse(&service.FullFacility{}), nil
	}

	for i, p := range res.Pricing {
		price, err := a.sc.V1Prices.Retrieve(ctx, p.ID, nil)
		if err != nil {
			a.log.Error("error getting price from stripe", "error", err)
			p.Price = 0
			continue
		}
		p.Price = float64(price.UnitAmount) / 100

		res.Pricing[i] = p
	}
	sort.Slice(res.Pricing, func(i, j int) bool {
		return res.Pricing[i].Price < res.Pricing[j].Price
	})

	facility := res.ToProto()
	a.log.Debug("GetFacility", "facility", facility.Pricing)
	return connect.NewResponse(&service.FullFacility{
		Facility:      facility.Facility,
		Pricing:       facility.Pricing,
		ReservationId: facility.ReservationId,
		Building:      facility.Building,
	}), nil
}
func (a *FacilityHandler) GetFacilityCategories(ctx context.Context, req *connect.Request[service.GetFacilityCategoriesRequest]) (*connect.Response[service.GetFacilityCategoriesResponse], error) {
	res, err := a.facilityStore.GetCategories(ctx)

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

	err := a.facilityStore.Create(ctx, facility)

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
		if !building.GoogleCalendarID.Valid {
			continue
		}
		calId := building.GoogleCalendarID.String

		a.log.Debug("GetAllEvents", "calId", calId)
		res, err := a.calendar.ListEvents(calId)
		if err != nil {

			continue
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
			a.log.Debug("GetAllEvents", "event", event)
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
	if res == nil || len(res.Items) == 0 {
		return connect.NewResponse(&service.GetEventsByFacilityResponse{
			Events: []*service.Event{},
		}), nil
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
	if !calendarID.Valid {
		return connect.NewResponse(&service.GetEventsByBuildingResponse{
			Events: []*service.Event{},
		}), nil
	}
	res, err := a.calendar.ListEvents(calendarID.String)
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

func (a *FacilityHandler) GetCategories(ctx context.Context, req *connect.Request[service.GetCategoriesRequest]) (*connect.Response[service.GetCategoriesResponse], error) {
	categories, err := a.facilityStore.GetCategories(ctx)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.GetCategoriesResponse{
		Categories: models.ToProtoCategories(categories),
	}), nil
}

func (a *FacilityHandler) GetAllCoords(ctx context.Context, req *connect.Request[service.GetAllCoordsRequest]) (*connect.Response[service.GetAllCoordsResponse], error) {
	coords, err := a.facilityStore.GetBuildingCoordinates(ctx)
	if err != nil {
		return nil, err
	}
	if len(coords) == 0 {
		return connect.NewResponse(&service.GetAllCoordsResponse{}), nil
	}
	return connect.NewResponse(&service.GetAllCoordsResponse{
		Data: models.CoordsToProto(coords),
	}), nil
}

func (a *FacilityHandler) GetProducts(ctx context.Context, req *connect.Request[service.GetProductsRequest]) (*connect.Response[service.GetProductsResponse], error) {
	params := &stripe.ProductListParams{}
	params.Limit = stripe.Int64(100)

	list := a.sc.V1Products.List(ctx, params)
	productNames := make(map[string]string, 0)
	for p := range list {
		productNames[p.ID] = p.Name
	}
	a.log.Debug("GetProducts", "products", productNames)
	var result []*service.ProductWithPricing
	for _, productId := range productNames {
		pricing, err := a.facilityStore.GetProductPricingWithCategories(ctx, productId)
		if err != nil {
			a.log.Error("error getting pricing from db", "error", err)
			return nil, err
		}
		if len(pricing) == 0 {
			continue
		}
		pricingProto := make([]*service.PricingWithCategory, len(pricing))
		for i, p := range pricing {
			pricingProto[i] = p.ToProto()
		}
		result = append(result, &service.ProductWithPricing{
			ProductId:   productId,
			ProductName: productNames[productId],
			Pricing:     pricingProto,
		})
	}

	return connect.NewResponse(&service.GetProductsResponse{
		Data: result,
	}), nil
}

func (a *FacilityHandler) GetPricing(ctx context.Context, req *connect.Request[service.GetPricingRequest]) (*connect.Response[service.PricingWithCategory], error) {
	pricing, err := a.facilityStore.GetPricing(ctx, req.Msg.GetPricingId())

	if err != nil {
		a.log.Error("error getting pricing from db", "error", err)
		return nil, err
	}

	price, err := a.sc.V1Prices.Retrieve(ctx, pricing.ID, nil)
	if err != nil {
		a.log.Error("error getting price from stripe", "error", err)
		return nil, err
	}
	pricing.Price = float64(price.UnitAmount) / 100
	category, err := a.facilityStore.GetCategory(ctx, pricing.CategoryID)
	if err != nil {
		a.log.Error("error getting category", "error", err)
		return nil, err
	}
	result := models.PricingWithCategory{
		Pricing:             pricing,
		CategoryName:        category.Name,
		CategoryDescription: category.Description,
	}

	return connect.NewResponse(result.ToProto()), nil
}
