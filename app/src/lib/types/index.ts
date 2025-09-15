import type { Path, UseFormRegister } from 'react-hook-form';
import type {
  FullReservation as PBFullReservation,
  FullFacility as PBFulFacility,
  FacilityWithCategories as PBFacilityWithCategories,
  Building as PBBuilding,
  BuildingWithFacilities as PBBuildingWithFacilities,
  Category as PBCategory,
  Facility as PBFacility,
  Reservation as PBReservation,
  Users as PBUser,
  ReservationDate as PBReservationDate,
  ReservationFee as PBReservationFee,
  GetSessionResponse as PBSession,
} from '../rpc/proto';

import type { Message } from '@bufbuild/protobuf';
export type ProtoType<T> = Omit<T, keyof Message<any>>;
export type Category = ProtoType<PBCategory>;
export type Facility = ProtoType<PBFacility>;
export type Reservation = ProtoType<PBReservation>;
export type User = ProtoType<PBUser>;
export type ReservationDate = ProtoType<PBReservationDate>;
export type ReservationFee = ProtoType<PBReservationFee>;
export type FullFacility = ProtoType<PBFulFacility>;
export type FullReservation = ProtoType<PBFullReservation>;
export type Building = ProtoType<PBBuilding>;
export type BuildingWithFacilities = ProtoType<PBBuildingWithFacilities>;
export type FacilityWithCategories = ProtoType<PBFacilityWithCategories>;
type SessionType = ProtoType<PBSession>;
export interface Session extends Omit<SessionType, 'userRole'> {
  userRole: UserRole;
}

export type UserRole = 'USER' | 'ADMIN' | 'STAFF' | 'GUEST';
export type ReservationStatus = 'pending' | 'approved' | 'denied' | 'canceled';

export interface FormData {
  eventName: string;
  Category: string;
  name: string;
  phone: string;
  email: string;
  recurrence: string;
  startDate: string;
  startTime: string;
  people: number;
  facility: string;
  endDate: string;
  endTime: string;
  details: string;
}

export interface IFormInput {
  eventName: string;
  Category: { label: string; value: number };
  name: string;
  phone: string;
  email: string;
  recurrence: { label: string; value: string };
  startDate: Date;
  people: number;
  techSupport: boolean;
  techDetails: string;
  doorAccess: boolean;
  doorDetails: string;

  events: {
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
  }[];
  details: string;
  building: { key: string; value: string };
  facilityName: { key: string; value: number; name: string };
}

export interface InputProps {
  label: Path<IFormInput>;
  register: UseFormRegister<IFormInput>;
  required: boolean;
  defaultValue?: string;
}

export interface TableReservation {
  eventName: string;
  Facility: string;
  ReservationDate: any[];
  approved: 'pending' | 'approved' | 'denied' | 'canceled';
  User?: string;
  Details: number;
}

export interface TableFacility {
  id: number;
  name: string;
  building: string;
  address: string;
  imagePath: string;
  capacity: number;
  googleCalendarId: string;
  Category: Category[];
}

export interface DateType {
  Options?: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  approved: 'pending' | 'approved' | 'denied' | 'canceled';
  ReservationID: any;
}

export interface Events {
  id: string;
  calendarId: string | null;
  title: string | null;
  start: string | number | Date;
  end: string | number | Date;
  location: string | null;
  recurringEventId: string | null;
  facilityId: bigint | number;
  Facility: Facility;
  placeholder: boolean;
}

export interface GoogleEvents {
  gLink: string | null | undefined;
  description: string | null | undefined;
  location: string | null | undefined;
  start: string | null | undefined;
  end: string | null | undefined;
  title: string | null | undefined;
}
export interface ChartData {
  month?: string;
  totalReservations?: number;
  buildingName?: string;
}

export interface RevenueData {
  month?: string;
  Revenue: number;
  Loss: number;
}
