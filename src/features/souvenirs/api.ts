import { registrationApi } from "../../lib/registrationApi";
import type { SouvenirEnquiryResult, SouvenirGuestEnquiry, SouvenirGuestOrder, SouvenirOrderResult, SouvenirProduct } from "./types";

interface Envelope<T> { success: boolean; message?: string; data: T; }

export const getSouvenirProducts = async (): Promise<SouvenirProduct[]> =>
  (await registrationApi.get<Envelope<SouvenirProduct[]>>("/souvenirs")).data.data;

export const getSouvenirProduct = async (slug: string): Promise<SouvenirProduct> =>
  (await registrationApi.get<Envelope<SouvenirProduct>>(`/souvenirs/${encodeURIComponent(slug)}`)).data.data;

export const createSouvenirOrder = async (payload: {
  customerName: string; customerEmail: string; customerWhatsApp: string;
  productId: string; quantity: number; colorOptionIds: string[]; customerNotes?: string;
}): Promise<SouvenirOrderResult> =>
  (await registrationApi.post<Envelope<SouvenirOrderResult>>("/souvenirs/orders", payload)).data.data;

export const createSouvenirEnquiry = async (payload: {
  customerName: string; customerEmail: string; customerWhatsApp: string;
  productId?: string; requestedQuantity?: number; designDescription: string; media: File[];
}): Promise<SouvenirEnquiryResult> => {
  const form = new FormData();
  form.append("customerName", payload.customerName);
  form.append("customerEmail", payload.customerEmail);
  form.append("customerWhatsApp", payload.customerWhatsApp);
  if (payload.productId) form.append("productId", payload.productId);
  if (payload.requestedQuantity) form.append("requestedQuantity", String(payload.requestedQuantity));
  form.append("designDescription", payload.designDescription);
  payload.media.forEach((file) => form.append("media", file));
  return (await registrationApi.post<Envelope<SouvenirEnquiryResult>>("/souvenirs/enquiries", form)).data.data;
};

export const getGuestSouvenirOrder = async (token: string): Promise<SouvenirGuestOrder> =>
  (await registrationApi.get<Envelope<SouvenirGuestOrder>>(`/souvenirs/orders/access/${encodeURIComponent(token)}`)).data.data;

export const getGuestSouvenirEnquiry = async (token: string): Promise<SouvenirGuestEnquiry> =>
  (await registrationApi.get<Envelope<SouvenirGuestEnquiry>>(`/souvenirs/enquiries/access/${encodeURIComponent(token)}`)).data.data;

export const respondToSouvenirQuote = async (token: string, quoteId: string, decision: "ACCEPT" | "DECLINE") =>
  (await registrationApi.post<Envelope<unknown>>(
    `/souvenirs/enquiries/access/${encodeURIComponent(token)}/quote-response`,
    { quoteId, decision },
  )).data;

 
// Authenticated catalogue administration.
export const getAdminSouvenirProducts = async (): Promise<SouvenirProduct[]> =>
  (await registrationApi.get<Envelope<SouvenirProduct[]>>("/souvenirs/admin/products")).data.data;

export const createAdminSouvenirProduct = async (payload: Record<string, unknown>): Promise<SouvenirProduct> =>
  (await registrationApi.post<Envelope<SouvenirProduct>>("/souvenirs/admin/products", payload)).data.data;

export const updateAdminSouvenirProduct = async (id: string, payload: Record<string, unknown>): Promise<SouvenirProduct> =>
  (await registrationApi.patch<Envelope<SouvenirProduct>>(`/souvenirs/admin/products/${encodeURIComponent(id)}`, payload)).data.data;

export const setAdminSouvenirProductActive = async (id: string, active: boolean): Promise<SouvenirProduct> =>
  (await registrationApi.patch<Envelope<SouvenirProduct>>(`/souvenirs/admin/products/${encodeURIComponent(id)}/status`, { active })).data.data;

export const createAdminSouvenirPriceTier = async (productId: string, payload: {
  label: string; minQuantity: number; maxQuantity?: number | null; totalPrice: number; currency: string; displayOrder?: number;
}) => (await registrationApi.post<Envelope<SouvenirProduct["priceTiers"][number]>>(
  `/souvenirs/admin/products/${encodeURIComponent(productId)}/price-tiers`, payload,
)).data.data;

export const setAdminSouvenirPriceTierActive = async (tierId: string, active: boolean) =>
  (await registrationApi.patch<Envelope<SouvenirProduct["priceTiers"][number]>>(
    `/souvenirs/admin/price-tiers/${encodeURIComponent(tierId)}/status`, { active },
  )).data.data;

export const uploadAdminSouvenirProductMedia = async (productId: string, files: File[]) => {
  const form = new FormData();
  files.forEach((file) => form.append("media", file));
  const path = "/souvenirs/admin/products/" + encodeURIComponent(productId) + "/media/upload";
  const response = await registrationApi.post<Envelope<SouvenirProduct["media"]>>(path, form);
  return response.data.data;
};
