import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganizationProfile, updateOrganizationProfile, type OrganizationProfile } from "../../api/siteContent.api";

const fields = [
  { name: "organizationName", label: "Organization name", required: true, maxLength: 160 },
  { name: "tagline", label: "Tagline", maxLength: 200 },
  { name: "description", label: "Short description", multiline: true, maxLength: 1200 },
  { name: "contactEmail", label: "Public contact email", type: "email", maxLength: 254 },
  { name: "phone", label: "Phone number", maxLength: 40 },
  { name: "whatsapp", label: "WhatsApp number (international format)", maxLength: 40 },
  { name: "address", label: "Organization address", multiline: true, maxLength: 1000 },
  { name: "operatingHours", label: "Operating hours", multiline: true, maxLength: 500 },
  { name: "instagramUrl", label: "Instagram URL", type: "url", maxLength: 500 },
  { name: "facebookUrl", label: "Facebook URL", type: "url", maxLength: 500 },
  { name: "linkedinUrl", label: "LinkedIn URL", type: "url", maxLength: 500 },
  { name: "tiktokUrl", label: "TikTok URL", type: "url", maxLength: 500 },
  { name: "youtubeUrl", label: "YouTube URL", type: "url", maxLength: 500 },
  { name: "copyrightText", label: "Footer copyright text", maxLength: 300 },
] as const;

const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-[#2A7F7F] focus:ring-2 focus:ring-[#2A7F7F]/15";

export default function AdminOrganizationPage() {
  const client = useQueryClient();
  const [message, setMessage] = useState("");
  const profile = useQuery({ queryKey: ["site-content", "organization"], queryFn: getOrganizationProfile });
  const save = useMutation({
    mutationFn: updateOrganizationProfile,
    onSuccess: async () => {
      setMessage("Organization information saved.");
      await client.invalidateQueries({ queryKey: ["site-content", "organization"] });
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(fields.map((field) => {
      const value = String(form.get(field.name) ?? "").trim();
      return [field.name, value || (field.name === "organizationName" ? "" : null)];
    })) as Partial<OrganizationProfile>;
    save.mutate(payload);
  };

  if (profile.isLoading) return <section className="p-6 lg:p-10"><p className="text-sm text-slate-500">Loading organization information…</p></section>;
  if (profile.isError) return <section className="p-6 lg:p-10"><p role="alert" className="text-sm text-red-700">Could not load organization information. Refresh the page to try again.</p></section>;

  return (
    <section className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-10">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2A7F7F]">Site administration</p>
        <h1 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">Organization information</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">Manage the public organization details displayed in the website footer. The public contact email here is separate from the transactional email sender configured on the backend.</p>
      </header>

      <form key={profile.data?.updatedAt ?? "organization-profile"} onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className={`block text-sm font-semibold text-slate-700 ${"multiline" in field && field.multiline ? "md:col-span-2" : ""}`}>
              {field.label}
              {"multiline" in field && field.multiline ? (
                <textarea name={field.name} rows={3} maxLength={field.maxLength} defaultValue={profile.data?.[field.name] ?? ""} className={inputClass} />
              ) : (
                <input name={field.name} type={"type" in field ? field.type : "text"} required={"required" in field && field.required} maxLength={field.maxLength} defaultValue={profile.data?.[field.name] ?? ""} className={inputClass} />
              )}
            </label>
          ))}
        </div>

        {save.isError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{save.error instanceof Error ? save.error.message : "Could not save organization information."}</p>}
        {message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-500">Changes are reflected on the public footer after the profile refreshes.</p>
          <button type="submit" disabled={save.isPending} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2A7F7F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236b6b] disabled:cursor-not-allowed disabled:opacity-60">{save.isPending ? "Saving…" : "Save organization information"}</button>
        </div>
      </form>
    </section>
  );
}
