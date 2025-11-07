package auth

const (
	// FacilitiesServiceGetAllFacilitiesProcedure is the fully-qualified name of the FacilitiesService's
	// GetAllFacilities RPC.
	FacilitiesServiceGetAllFacilitiesProcedure = "/api.facilities.FacilitiesService/GetAllFacilities" // nolint:gosec
	// FacilitiesServiceGetAllBuildingsProcedure is the fully-qualified name of the FacilitiesService's
	// GetAllBuildings RPC.
	FacilitiesServiceGetAllBuildingsProcedure = "/api.facilities.FacilitiesService/GetAllBuildings" // nolint:gosec
	// FacilitiesServiceGetFacilityProcedure is the fully-qualified name of the FacilitiesService's
	// GetFacility RPC.
	FacilitiesServiceGetFacilityProcedure = "/api.facilities.FacilitiesService/GetFacility"
	// FacilitiesServiceGetEventsByFacilityProcedure is the fully-qualified name of the
	// FacilitiesService's GetEventsByFacility RPC.
	FacilitiesServiceGetEventsByFacilityProcedure = "/api.facilities.FacilitiesService/GetEventsByFacility"
	// FacilitiesServiceGetEventsByBuildingProcedure is the fully-qualified name of the
	// FacilitiesService's GetEventsByBuilding RPC.
	FacilitiesServiceGetEventsByBuildingProcedure = "/api.facilities.FacilitiesService/GetEventsByBuilding"
	// FacilitiesServiceGetAllEventsProcedure is the fully-qualified name of the FacilitiesService's
	// GetAllEvents RPC.
	FacilitiesServiceGetAllEventsProcedure = "/api.facilities.FacilitiesService/GetAllEvents"
	// FacilitiesServiceGetFacilityCategoriesProcedure is the fully-qualified name of the
	// FacilitiesService's GetFacilityCategories RPC.
	FacilitiesServiceGetFacilityCategoriesProcedure = "/api.facilities.FacilitiesService/GetFacilityCategories"
	// FacilitiesServiceGetBuildingFacilitiesProcedure is the fully-qualified name of the
	// FacilitiesService's GetBuildingFacilities RPC.
	FacilitiesServiceGetBuildingFacilitiesProcedure = "/api.facilities.FacilitiesService/GetBuildingFacilities"
	// FacilitiesServiceCreateFacilityProcedure is the fully-qualified name of the FacilitiesService's
	// CreateFacility RPC.
	FacilitiesServiceGetCategoryProcedure = "/api.facilities.FacilitiesService/GetCategory"
	// FacilitiesServiceGetAllCoordsProcedure is the fully-qualified name of the FacilitiesService's
	// GetAllCoords RPC.
	FacilitiesServiceGetAllCoordsProcedure = "/api.facilities.FacilitiesService/GetAllCoords"

	// AuthLoginProcedure is the fully-qualified name of the Auth's Login RPC.
	AuthLoginProcedure = "/api.auth.Auth/Login" // nolint:gosec
	// AuthRegisterProcedure is the fully-qualified name of the Auth's Register RPC.
	AuthRegisterProcedure = "/api.auth.Auth/Register" // nolint:gosec

	AuthVerify2FACodeProcedure        = "/api.auth.Auth/Verify2FACode"        // nolint:gosec
	AuthRequestResetPasswordProcedure = "/api.auth.Auth/RequestResetPassword" // nolint:gosec
	AuthResetPasswordProcedure        = "/api.auth.Auth/ResetPassword"        // nolint:gosec
	AuthVerifyResetPassword           = "/api.auth.Auth/VerifyResetPassword"  // nolint:gosec
)
