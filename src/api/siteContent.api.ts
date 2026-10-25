import { registrationApi } from "../lib/registrationApi";

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export interface HomepageHero {
  id: string; eyebrow?: string | null; heading: string; highlightText?: string | null;
  description: string; primaryCtaLabel?: string | null; primaryCtaUrl?: string | null;
  secondaryCtaLabel?: string | null; secondaryCtaUrl?: string | null;
  imageUrl?: string | null; imagePublicId?: string | null; imageAltText?: string | null;
  status: ContentStatus; publishedAt?: string | null; updatedAt: string;
}
export interface GalleryCategory {
  id: string; name: string; slug: string; description?: string | null; displayOrder: number; active: boolean;
  images?: GalleryImage[]; _count?: { images: number };
}
export interface GalleryImage {
  id: string; categoryId: string; url: string; publicId: string; altText: string;
  caption?: string | null; description?: string | null; displayOrder: number; featured: boolean;
  status: ContentStatus; category?: Pick<GalleryCategory, "id" | "name" | "slug">;
}
export interface Resource {
  id: string; title: string; slug: string; description?: string | null; fileUrl: string;
  filePublicId: string; fileBytes: number; pageCount?: number | null; coverImageUrl?: string | null;
  trainingProgramId?: string | null; status: ContentStatus; publishedAt?: string | null;
  trainingProgram?: { title: string; slug: string };
}
interface Envelope<T> { success: boolean; message?: string; data: T }
export interface UploadedAsset { url: string; publicId: string; resourceType: string; format: string; bytes: number }

const unwrap = <T,>(response: { data: Envelope<T> }) => response.data.data;

export const getPublicHero = async () => unwrap(await registrationApi.get<Envelope<HomepageHero | null>>("/site-content/hero"));
export const getAdminHeroes = async () => unwrap(await registrationApi.get<Envelope<HomepageHero[]>>("/site-content/admin/hero"));
export const createHero = async (data: Partial<HomepageHero> & Pick<HomepageHero, "heading" | "description">) => unwrap(await registrationApi.post<Envelope<HomepageHero>>("/site-content/admin/hero", data));
export const updateHero = async (id: string, data: Partial<HomepageHero>) => unwrap(await registrationApi.patch<Envelope<HomepageHero>>(`/site-content/admin/hero/${id}`, data));
export const publishHero = async (id: string) => unwrap(await registrationApi.post<Envelope<HomepageHero>>(`/site-content/admin/hero/${id}/publish`));

export const getPublicCategories = async () => unwrap(await registrationApi.get<Envelope<GalleryCategory[]>>("/site-content/gallery/categories"));
export const getAdminCategories = async () => unwrap(await registrationApi.get<Envelope<GalleryCategory[]>>("/site-content/admin/gallery/categories"));
export const createCategory = async (data: Pick<GalleryCategory, "name" | "slug"> & Partial<GalleryCategory>) => unwrap(await registrationApi.post<Envelope<GalleryCategory>>("/site-content/admin/gallery/categories", data));
export const updateCategory = async (id: string, data: Partial<GalleryCategory>) => unwrap(await registrationApi.patch<Envelope<GalleryCategory>>(`/site-content/admin/gallery/categories/${id}`, data));
export const deleteCategory = async (id: string) => registrationApi.delete(`/site-content/admin/gallery/categories/${id}`);
export const getPublicGallery = async (category?: string) => unwrap(await registrationApi.get<Envelope<GalleryImage[]>>("/site-content/gallery", { params: category ? { category } : {} }));
export const getAdminGallery = async () => unwrap(await registrationApi.get<Envelope<GalleryImage[]>>("/site-content/admin/gallery"));
export const createGalleryImage = async (data: Omit<GalleryImage, "id" | "status" | "category">) => unwrap(await registrationApi.post<Envelope<GalleryImage>>("/site-content/admin/gallery", data));
export const updateGalleryImage = async (id: string, data: Partial<GalleryImage>) => unwrap(await registrationApi.patch<Envelope<GalleryImage>>(`/site-content/admin/gallery/${id}`, data));
export const deleteGalleryImage = async (id: string) => registrationApi.delete(`/site-content/admin/gallery/${id}`);

export const getPublicResources = async (search?: string) => unwrap(await registrationApi.get<Envelope<Resource[]>>("/site-content/resources", { params: search ? { search } : {} }));
export const getPublicResource = async (slug: string) => unwrap(await registrationApi.get<Envelope<Resource>>(`/site-content/resources/${slug}`));
export const getAdminResources = async () => unwrap(await registrationApi.get<Envelope<Resource[]>>("/site-content/admin/resources"));
export const createResource = async (data: Pick<Resource, "title" | "slug" | "fileUrl" | "filePublicId" | "fileBytes"> & Partial<Resource>) => unwrap(await registrationApi.post<Envelope<Resource>>("/site-content/admin/resources", data));
export const updateResource = async (id: string, data: Partial<Resource>) => unwrap(await registrationApi.patch<Envelope<Resource>>(`/site-content/admin/resources/${id}`, data));
export const deleteResource = async (id: string) => registrationApi.delete(`/site-content/admin/resources/${id}`);

const uploadAsset = async (endpoint: string, file: File): Promise<UploadedAsset> => {
  const form = new FormData(); form.append("file", file);
  return unwrap(await registrationApi.post<Envelope<UploadedAsset>>(endpoint, form));
};
export const uploadHeroImage = (file: File) => uploadAsset("/site-content/admin/uploads/hero-image", file);
export const uploadGalleryImage = (file: File) => uploadAsset("/site-content/admin/uploads/gallery-image", file);
export const uploadResourcePdf = (file: File) => uploadAsset("/site-content/admin/uploads/resource-pdf", file);

export const getResourceDownloadUrl = (slug: string) => `${(registrationApi.defaults.baseURL ?? "").replace(/\/$/, "")}/site-content/resources/${encodeURIComponent(slug)}/download`;

export interface FounderProfile {
  id: string;
  name: string;
  role: string;
  mediaUrl?: string | null;
  mediaPublicId?: string | null;
  mediaAltText?: string | null;
  updatedAt?: string;
}
export const getFounderProfile = async () => unwrap(await registrationApi.get<Envelope<FounderProfile>>("/site-content/founder"));
export const updateFounderProfile = async (data: Partial<FounderProfile>) => unwrap(await registrationApi.patch<Envelope<FounderProfile>>("/site-content/admin/founder", data));
