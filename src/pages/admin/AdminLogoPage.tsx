import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, UploadCloud } from "lucide-react";
import { getSiteBranding, updateSiteBranding, uploadSiteLogo } from "../../api/siteContent.api";

const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#2A7F7F] focus:ring-2 focus:ring-[#2A7F7F]/15";

export default function AdminLogoPage() {
  const client = useQueryClient();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const branding = useQuery({ queryKey: ["site-content", "branding"], queryFn: getSiteBranding });

  const save = useMutation({
    mutationFn: async (formElement: HTMLFormElement) => {
      const form = new FormData(formElement);
      const file = form.get("logo");
      let asset: Awaited<ReturnType<typeof uploadSiteLogo>> | undefined;
      if (file instanceof File && file.size > 0) asset = await uploadSiteLogo(file);
      if (!asset && !branding.data?.logoUrl) throw new Error("Choose a logo image before saving.");
      return updateSiteBranding({
        ...(asset ? { logoUrl: asset.url, logoPublicId: asset.publicId } : {}),
        logoAltText: String(form.get("logoAltText") || "KPX Academy logo").trim(),
      });
    },
    onSuccess: async () => {
      setNotice("Site logo updated. The public header and footer will use the new logo.");
      setError("");
      await Promise.all([
        client.invalidateQueries({ queryKey: ["site-content", "branding"] }),
        client.invalidateQueries({ queryKey: ["site-content", "admin", "branding"] }),
      ]);
    },
    onError: (caught) => {
      setError(caught instanceof Error ? caught.message : "Could not update the site logo.");
      setNotice("");
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    void save.mutateAsync(formElement);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-8">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#2A7F7F]">Site management</p>
      <h1 className="mt-2 text-3xl font-bold text-[#17324D]">Site logo</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Upload the official KPX Academy logo. It is stored in Cloudinary and used in the public website header and footer.</p>
      {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {(error || branding.isError) && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error || "Could not load current site branding."}</p>}
      <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        {branding.isLoading ? <p className="text-sm text-slate-500">Loading site branding…</p> : <>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#F7F5F0] p-6">
            <div className="flex min-h-36 items-center justify-center">
              {branding.data?.logoUrl ? <img src={branding.data.logoUrl} alt={branding.data.logoAltText || "Current KPX Academy logo"} className="max-h-28 max-w-full object-contain" /> : <div className="text-center text-slate-500"><ImagePlus className="mx-auto mb-2" size={28}/><p className="text-sm font-medium">No custom logo uploaded</p><p className="mt-1 text-xs">The site will continue to show the text logo.</p></div>}
            </div>
            {branding.data?.logoUrl && <p className="mt-3 text-center text-xs text-slate-500">Current uploaded logo</p>}
          </div>
          <div>
            <label htmlFor="site-logo-file" className="text-sm font-semibold text-slate-700">Logo image</label>
            <input id="site-logo-file" name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={fieldClass}/>
            <p className="mt-1 text-xs leading-5 text-slate-500">PNG with a transparent background is recommended. JPEG, PNG, WEBP, or GIF; maximum 15 MB. Leave empty to update alt text only.</p>
          </div>
          <div>
            <label htmlFor="site-logo-alt" className="text-sm font-semibold text-slate-700">Accessible logo description</label>
            <input id="site-logo-alt" name="logoAltText" maxLength={300} defaultValue={branding.data?.logoAltText || "KPX Academy logo"} className={fieldClass} placeholder="KPX Academy logo"/>
          </div>
          <button type="submit" disabled={save.isPending} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#17324D] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><UploadCloud size={16}/>{save.isPending ? "Uploading and saving…" : "Upload and save logo"}</button>
        </>}
      </form>
    </div>
  );
}
