import { registrationApi } from "../../lib/registrationApi";
import type { CreateWorkshopBookingPayload, GuestWorkshopBooking, WorkshopBookingResult, WorkshopOffering } from "./types";

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getWorkshopOfferings = async (): Promise<WorkshopOffering[]> =>
  (await registrationApi.get<Envelope<WorkshopOffering[]>>("/workshops")).data.data;

export const createWorkshopBooking = async (
  payload: CreateWorkshopBookingPayload,
): Promise<WorkshopBookingResult> =>
  (await registrationApi.post<Envelope<WorkshopBookingResult>>("/workshops/bookings", payload)).data.data;

export const getGuestWorkshopBooking = async (
  reference: string,
  token: string,
): Promise<GuestWorkshopBooking> =>
  (await registrationApi.get<Envelope<GuestWorkshopBooking>>(
    `/workshops/bookings/access/${encodeURIComponent(reference)}/${encodeURIComponent(token)}`,
  )).data.data;
