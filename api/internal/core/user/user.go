package user

import (
	service "api/internal/proto/users"
	"connectrpc.com/connect"
	"context"
)

func (a *Adapter) GetUserByEmail(ctx context.Context, req *connect.Request[service.UserByEmailRequest]) (*connect.Response[service.Users], error)
func (a *Adapter) GetUser(ctx context.Context, req *connect.Request[service.GetUserRequest]) (*connect.Response[service.Users], error)
func (a *Adapter) GetUsers(ctx context.Context, req *connect.Request[service.GetUsersRequest]) (*connect.Response[service.GetUsersResponse], error)
func (a *Adapter) CreateUser(ctx context.Context, req *connect.Request[service.CreateUserRequest]) (*connect.Response[service.Users], error)
func (a *Adapter) UpdateUser(ctx context.Context, req *connect.Request[service.UpdateUserRequest]) (*connect.Response[service.Users], error)
func (a *Adapter) DeleteUser(ctx context.Context, req *connect.Request[service.DeleteUserRequest]) (*connect.Response[service.DeleteUserResponse], error)
func (a *Adapter) GetNotifications(ctx context.Context, req *connect.Request[service.GetNotificationsRequest]) (*connect.Response[service.GetNotificationsResponse], error)
func (a *Adapter) GetUserNotifications(ctx context.Context, req *connect.Request[service.GetUserNotificationsRequest]) (*connect.Response[service.GetUserNotificationsResponse], error)
func (a *Adapter) CreateNotification(ctx context.Context, req *connect.Request[service.CreateNotificationRequest]) (*connect.Response[service.Notifications], error)
func (a *Adapter) EditNotification(ctx context.Context, req *connect.Request[service.EditNotificationRequest]) (*connect.Response[service.Notifications], error)
func (a *Adapter) DeleteNotification(ctx context.Context, req *connect.Request[service.DeleteNotificationRequest]) (*connect.Response[service.DeleteNotificationResponse], error)
