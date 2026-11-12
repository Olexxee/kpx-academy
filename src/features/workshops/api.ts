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

export interface WorkshopGuestAccessChallenge {
  challengeToken: string;
  expiresInSeconds: number;
  message: string;
}
export interface WorkshopGuestAccessSession {
  accessToken: string;
  expiresAt: string;
  accessUrlPath: string;
}
export const requestGuestWorkshopAccessCode = async (reference: string): Promise<WorkshopGuestAccessChallenge> =>
  (await registrationApi.post<Envelope<WorkshopGuestAccessChallenge>>("/workshops/bookings/track/request", { reference: reference.trim().toUpperCase() })).data.data;
export const verifyGuestWorkshopAccessCode = async (payload: { reference: string; challengeToken: string; code: string }): Promise<WorkshopGuestAccessSession> =>
  (await registrationApi.post<Envelope<WorkshopGuestAccessSession>>("/workshops/bookings/track/verify", { ...payload, reference: payload.reference.trim().toUpperCase() })).data.data;
