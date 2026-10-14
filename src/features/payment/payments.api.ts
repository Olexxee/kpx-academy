import { registrationApi } from "../../lib/registrationApi";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface InitializePaymentData {
  name: string;
  email: string;
  trainingProgramId: string;
}

export interface InitializePaymentResponse {
  registrationId: string;
  paymentId: string;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: string | number;
  currency: string;
}

export interface VerifyPaymentResponse {
  reference: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "ABANDONED" | "REVERSED";
  registrationStatus: "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";
  alreadyProcessed: boolean;
}

export const initializePayment = async (
  data: InitializePaymentData,
): Promise<InitializePaymentResponse> => {
  const response = await registrationApi.post<
    ApiEnvelope<InitializePaymentResponse>
  >("/payments/initialize", data);

  return response.data.data;
};

export const verifyPayment = async (
  reference: string,
): Promise<VerifyPaymentResponse> => {
  const response = await registrationApi.get<
    ApiEnvelope<VerifyPaymentResponse>
  >(`/payments/verify/${encodeURIComponent(reference)}`);

  return response.data.data;
};
