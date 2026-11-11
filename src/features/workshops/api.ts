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

export const respondToWorkshopProposal = async (
  reference: string,
  token: string,
  decision: "ACCEPT" | "DECLINE",
): Promise<{ publicReference: string; status: string; proposalRespondedAt: string }> =>
  (await registrationApi.post<Envelope<{ publicReference: string; status: string; proposalRespondedAt: string }>>(
    `/workshops/bookings/access/${encodeURIComponent(reference)}/${encodeURIComponent(token)}/respond`,
    { decision },
  )).data.data;


export interface InitializeWorkshopPaymentResponse {
  paymentId: string;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: string | number;
  currency: string;
}

export const initializeWorkshopPayment = async (
  reference: string,
  token: string,
): Promise<InitializeWorkshopPaymentResponse> =>
  (await registrationApi.post<Envelope<InitializeWorkshopPaymentResponse>>(
    "/payments/workshops/initialize",
    { reference, token },
  )).data.data;
