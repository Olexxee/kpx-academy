import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFounderProfile, updateFounderProfile, uploadHeroImage } from "../../api/siteContent.api";

const inputClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#1D4ED8]";

export default function AdminFounderPage() {
  const client = useQueryClient();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const profile = useQuery({ queryKey: ["site-content", "founder"], queryFn: getFounderProfile });
  const save = useMutation({
    mutationFn: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      let asset: Awaited<ReturnType<typeof uploadHeroImage>> | undefined;
      const file = form.get("image");
      if (file instanceof File && file.size > 0) asset = await uploadHeroImage(file);
      return updateFounderProfile({
        name: String(form.get("name") || "").trim(),
        role: String(form.get("role") || "Founder").trim(),
        mediaAltText: String(form.get("mediaAltText") || "").trim(),
        ...(asset ? { mediaUrl: asset.url, mediaPublicId: asset.publicId } : {}),
      });
    },
    onSuccess: async () => { setNotice("Founder profile updated."); setError(""); await client.invalidateQueries({ queryKey: ["site-content", "founder"] }); },
    onError: (caught) => { setError(caught instanceof Error ? caught.message : "Could not update founder profile."); setNotice(""); },
  });
  const submit = (event: FormEvent<HTMLFormElement>) => { void save.mutateAsync(event); };
  return <div className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8B1E5A]">Site management</p>
    <h1 className="mt-2 text-3xl font-bold text-slate-900">Founder media</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Update the founder's public name, role, and portrait displayed on the About page. The existing biography copy stays unchanged.</p>
    {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
    {(error || profile.isError) && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error || "Could not load founder profile."}</p>}
    <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {profile.isLoading ? <p className="text-sm text-slate-500">Loading founder profile…</p> : <>
        {profile.data?.mediaUrl && <div className="flex items-center gap-4"><img src={profile.data.mediaUrl} alt={profile.data.mediaAltText || profile.data.name} className="h-28 w-24 rounded-xl object-cover"/><div><p className="font-semibold text-slate-900">Current portrait</p><p className="mt-1 text-sm text-slate-500">Upload a new image below to replace it.</p></div></div>}
        <div><label className="text-sm font-semibold text-slate-700">Founder name</label><input name="name" required minLength={2} maxLength={160} defaultValue={profile.data?.name ?? "Kepemi Oluwafunke (Keplex)"} className={inputClass}/></div>
        <div><label className="text-sm font-semibold text-slate-700">Role</label><input name="role" required minLength={2} maxLength={120} defaultValue={profile.data?.role ?? "Founder"} className={inputClass}/></div>
        <div><label className="text-sm font-semibold text-slate-700">Portrait image</label><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={inputClass}/><p className="mt-1 text-xs text-slate-500">Leave empty to keep the current image. JPEG, PNG, WEBP or GIF; maximum 15 MB.</p></div>
        <div><label className="text-sm font-semibold text-slate-700">Image alt text</label><input name="mediaAltText" maxLength={300} defaultValue={profile.data?.mediaAltText ?? ""} className={inputClass} placeholder="Portrait of the KPX Academy founder"/></div>
        <button disabled={save.isPending} className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{save.isPending ? "Saving…" : "Save founder profile"}</button>
      </>}
    </form>
  </div>;
}
