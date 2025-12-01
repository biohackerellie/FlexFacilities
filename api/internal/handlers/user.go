package handlers

import (
	"api/internal/models"
	"api/internal/ports"
	service "api/internal/proto/users"
	"connectrpc.com/connect"
	"context"
	"log/slog"
)

type UserHandler struct {
	userStore ports.UserStore
	log       *slog.Logger
}

func NewUserHandler(userStore ports.UserStore, log *slog.Logger) *UserHandler {
	log.With(slog.Group("Core_UserHandler", slog.String("name", "user")))
	return &UserHandler{userStore: userStore, log: log}
}
func (a *UserHandler) GetUserByEmail(ctx context.Context, req *connect.Request[service.UserByEmailRequest]) (*connect.Response[service.Users], error) {
	user, err := a.userStore.GetByEmail(ctx, req.Msg.GetEmail())
	if err != nil {
		return nil, err
	}

	return connect.NewResponse(user.ToProto()), nil
}
func (a *UserHandler) GetUser(ctx context.Context, req *connect.Request[service.GetUserRequest]) (*connect.Response[service.Users], error) {
	user, err := a.userStore.Get(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}

	return connect.NewResponse(user.ToProto()), nil
}
func (a *UserHandler) GetUsers(ctx context.Context, req *connect.Request[service.GetUsersRequest]) (*connect.Response[service.GetUsersResponse], error) {
	users, err := a.userStore.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	proto := models.UsersToProto(users)
	return connect.NewResponse(&service.GetUsersResponse{
		Users: proto,
	}), nil
}
func (a *UserHandler) CreateUser(ctx context.Context, req *connect.Request[service.CreateUserRequest]) (*connect.Response[service.Users], error) {
	user := models.ToUser(req.Msg.GetUser())
	user, err := a.userStore.Create(ctx, user)
	if err != nil {
		a.log.Error("Error creating user", "error", err)
		return nil, err
	}

	return connect.NewResponse(user.ToProto()), nil
}

func (a *UserHandler) UpdateUser(ctx context.Context, req *connect.Request[service.UpdateUserRequest]) (*connect.Response[service.Users], error) {
	user := models.ToUser(req.Msg.GetUser())
	user, err := a.userStore.Update(ctx, user)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(user.ToProto()), nil
}

func (a *UserHandler) DeleteUser(ctx context.Context, req *connect.Request[service.DeleteUserRequest]) (*connect.Response[service.DeleteUserResponse], error) {
	err := a.userStore.Delete(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteUserResponse{}), nil
}

func (a *UserHandler) GetNotifications(ctx context.Context, req *connect.Request[service.GetNotificationsRequest]) (*connect.Response[service.GetNotificationsResponse], error) {
	notifications, err := a.userStore.GetNotifications(ctx)
	if err != nil {
		return nil, err
	}

	return connect.NewResponse(&service.GetNotificationsResponse{
		Notifications: models.NotificationsToProto(notifications),
	}), nil
}

func (a *UserHandler) GetUserNotifications(ctx context.Context, req *connect.Request[service.GetUserNotificationsRequest]) (*connect.Response[service.GetUserNotificationsResponse], error) {
	notifications, err := a.userStore.GetUserNotifications(ctx, req.Msg.UserId)
	if err != nil {
		a.log.ErrorContext(ctx, "Error getting user notifications", "error", err)
		return nil, err
	}

	return connect.NewResponse(&service.GetUserNotificationsResponse{
		Notifications: models.NotificationsReadableToProto(notifications),
	}), nil
}

func (a *UserHandler) CreateNotification(ctx context.Context, req *connect.Request[service.CreateNotificationRequest]) (*connect.Response[service.Notifications], error) {
	notification := req.Msg.GetNotification()

	err := a.userStore.CreateNotification(ctx, models.ToNotification(notification))
	if err != nil {
		a.log.Error("Error creating notification", "error", err)
		return nil, err
	}
	return connect.NewResponse(&service.Notifications{}), nil
}
func (a *UserHandler) EditNotification(ctx context.Context, req *connect.Request[service.EditNotificationRequest]) (*connect.Response[service.Notifications], error) {
	notification := req.Msg.GetNotification()
	err := a.userStore.EditNotification(ctx, models.ToNotification(notification))
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.Notifications{}), nil
}
func (a *UserHandler) DeleteNotification(ctx context.Context, req *connect.Request[service.DeleteNotificationRequest]) (*connect.Response[service.DeleteNotificationResponse], error) {
	err := a.userStore.DeleteNotification(ctx, req.Msg.GetId())
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(&service.DeleteNotificationResponse{}), nil
}
