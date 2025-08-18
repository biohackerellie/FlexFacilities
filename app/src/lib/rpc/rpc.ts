import {createClient,  type Transport, type Client, ConnectError} from '@connectrpc/connect'
import {Auth, FacilitiesService, GetUsersRequestSchema, ReservationService, UsersService} from './proto'

export class RPC { 
  private transport: Transport
  private _Auth?: Client<typeof Auth>
  private _FacilitiesService?: Client<typeof FacilitiesService>
  private _ReservationService?: Client<typeof ReservationService>
  private _UsersService?: Client<typeof UsersService>

  constructor(transport: Transport) {
    this.transport = transport
  }

  auth() {
    if (!this._Auth){
      this._Auth = createClient(Auth, this.transport)
    }
    return {
      getSession: this.errorWrapper(this._Auth.getSession),
      login: this.errorWrapper(this._Auth.login),
      register: this.errorWrapper(this._Auth.register)
    }
  }

  facilities() {
    if (!this._FacilitiesService){
      this._FacilitiesService = createClient(FacilitiesService, this.transport)
    }
    return {
      getAllFacilities: this.errorWrapper(this._FacilitiesService.getAllFacilities), 
      getFacility: this.errorWrapper(this._FacilitiesService.getFacility),
      getFacilityCategories: this.errorWrapper(this._FacilitiesService.getFacilityCategories),
      getBuildingFacilities: this.errorWrapper(this._FacilitiesService.getBuildingFacilities),
      createFacility: this.errorWrapper(this._FacilitiesService.createFacility),
      updateFacility: this.errorWrapper(this._FacilitiesService.updateFacility),
      deleteFacility: this.errorWrapper(this._FacilitiesService.deleteFacility),
      updateFacilityCategory: this.errorWrapper(this._FacilitiesService.updateFacilityCategory),
    }
  }

  reservation() {
    if (!this._ReservationService){
      this._ReservationService = createClient(ReservationService, this.transport)
    }
    return {
      ...this._ReservationService,
      getAllReservations: this.errorWrapper(this._ReservationService.getAllReservations),
      getReservation: this.errorWrapper(this._ReservationService.getReservation),
      requestCount: this.errorWrapper(this._ReservationService.requestCount),
      getRequestsThisWeek: this.errorWrapper(this._ReservationService.getRequestsThisWeek),
      createReservation: this.errorWrapper(this._ReservationService.createReservation),
      updateReservation: this.errorWrapper(this._ReservationService.updateReservation),
      deleteReservation: this.errorWrapper(this._ReservationService.deleteReservation),
      userReservations: this.errorWrapper(this._ReservationService.userReservations),
      createReservationDate: this.errorWrapper(this._ReservationService.createReservationDate),
      updateReservationDate: this.errorWrapper(this._ReservationService.updateReservationDate),
      deleteReservationDate: this.errorWrapper(this._ReservationService.deleteReservationDate),
      createReservationFee: this.errorWrapper(this._ReservationService.createReservationFee),
      updateReservationFee: this.errorWrapper(this._ReservationService.updateReservationFee),
      deleteReservationFee: this.errorWrapper(this._ReservationService.deleteReservationFee),
    }
  }

  users() {
    if(!this._UsersService){
      this._UsersService = createClient(UsersService, this.transport)
    }
    return {
      ...this._UsersService,
      getUserByEmail: this.errorWrapper(this._UsersService.getUserByEmail),
      getUser: this.errorWrapper(this._UsersService.getUser),
      getUsers: this.errorWrapper(this._UsersService.getUsers),
      createUser: this.errorWrapper(this._UsersService.createUser),
      updateUser: this.errorWrapper(this._UsersService.updateUser),
      deleteUser: this.errorWrapper(this._UsersService.deleteUser),
      getNotifications: this.errorWrapper(this._UsersService.getNotifications),
      createNotification: this.errorWrapper(this._UsersService.createNotification),
      editNotification: this.errorWrapper(this._UsersService.editNotification),
      deleteNotification: this.errorWrapper(this._UsersService.deleteNotification),
    }
  }

  private errorWrapper<Req,Res>(
    method: (req: Req) => Promise<Res>
  ): (req: Req) => Promise<RPCResponse<Awaited<Res>>> {
    return async (req: Req) => {
      try {
        const data = await method(req)
        return new RPCResponse(data, null)
      } catch (error) {
        if (error instanceof ConnectError) {
          return new RPCResponse<Awaited<Res>>(null, error)
        }
        const newError = ConnectError.from(error)
        return new RPCResponse<Awaited<Res>>(null, newError)
      }

    }
  }
}


export class RPCResponse<T> {
  data: T | null
  error: ConnectError | null

  constructor(data: T | null, error: ConnectError | null) {
    this.data = data
    this.error = error
  }

  isSuccess(): boolean {
    return this.error === null
  }

  isError(): boolean {
    return this.error !== null
  }
}
