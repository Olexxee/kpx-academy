import { registrationApi } from "../../lib/registrationApi";
import type { CreateWorkshopBookingPayload, WorkshopBookingResult, WorkshopOffering } from "./types";

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
