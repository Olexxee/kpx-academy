import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import {
  getAdminSouvenirPricingSchedule,
  replaceAdminSouvenirPricingSchedule,
} from "../../features/souvenirs/api";

type DraftBand = { minQuantity: string; unitPrice: string };
const field = "min-w-0 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2A7F7F]";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500";
const money = (value: string | number) => `₦${Number(value).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SouvenirPricingScheduleEditor({ productId, productName }: { productId: string; productName: string }) {
  const client = useQueryClient();
  const schedule = useQuery({
    queryKey: ["souvenirs", "pricing-schedule", productId],
    queryFn: () => getAdminSouvenirPricingSchedule(productId),
  });
  const [bands, setBands] = useState<DraftBand[]>([]);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (schedule.data) {
      setBands(schedule.data.bands.map((band) => ({
        minQuantity: String(band.minQuantity),
        unitPrice: String(band.unitPrice),
      })));
    }
  }, [schedule.data?.version, schedule.dataUpdatedAt]);

  const validation = useMemo(() => {
    if (!bands.length) return "Add at least one quantity band.";
    for (let index = 0; index < bands.length; index += 1) {
      const min = Number(bands[index].minQuantity);
      const price = bands[index].unitPrice.trim();
      if (!Number.isSafeInteger(min) || min < 1) return `Band ${index + 1}: minimum quantity must be a whole number of at least 1.`;
      if (index > 0 && min <= Number(bands[index - 1].minQuantity)) return "Minimum quantities must be strictly increasing.";
      if (!/^\d+(?:\.\d{1,2})?$/.test(price) || Number(price) <= 0) return `Band ${index + 1}: enter a positive NGN rate with no more than two decimal places.`;
    }
    return "";
  }, [bands]);

  const save = useMutation({
    mutationFn: () => replaceAdminSouvenirPricingSchedule(productId, {
      expectedVersion: schedule.data?.version ?? 0,
      bands: bands.map((band) => ({ minQuantity: Number(band.minQuantity), unitPrice: band.unitPrice.trim() })),
    }),
    onSuccess: async (result) => {
      setNotice(`Pricing schedule v${result.version} saved.`);
      await client.invalidateQueries({ queryKey: ["souvenirs"] });
      await schedule.refetch();
    },
  });

  const updateBand = (index: number, key: keyof DraftBand, value: string) => {
    setBands((current) => current.map((band, bandIndex) => bandIndex === index ? { ...band, [key]: value } : band));
    setNotice("");
  };

  if (schedule.isLoading) return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Loading pricing schedule…</div>;
  if (schedule.isError || !schedule.data) return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>Could not load the pricing schedule for {productName}.</p><button type="button" onClick={() => schedule.refetch()} className="mt-2 font-semibold underline">Retry</button></div>;

  const currentVersion = schedule.data.version;
  return <section className="rounded-2xl border border-[#2A7F7F]/20 bg-[#F7F5F0] p-3 sm:p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-wide text-[#2A7F7F]">Versioned pricing</p><h4 className="mt-1 font-semibold text-slate-900">Quantity schedule</h4><p className="mt-1 text-xs text-slate-500">Version {currentVersion} · Rates are per piece · Currency NGN</p></div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${schedule.data.isValid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{schedule.data.isValid ? "Valid schedule" : "Needs configuration"}</span>
    </div>
    <p className="mt-3 text-xs leading-5 text-slate-600">Enter the starting quantity and per-piece rate for each band. The system calculates each band's upper limit from the next band's starting quantity. The final band is always open-ended. Save replaces the entire schedule as one version.</p>
    <div className="mt-4 space-y-3">
      {bands.map((band, index) => {
        const next = bands[index + 1];
        const min = Number(band.minQuantity);
        const max = next ? Number(next.minQuantity) - 1 : null;
        const range = Number.isFinite(min) && min > 0 ? (max === null ? `${min}+` : `${min}–${max}`) : "Enter a valid minimum";
        return <div key={index} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-slate-800">Band {index + 1} <span className="ml-1 font-normal text-slate-500">· {range} pieces</span></p>{bands.length > 1 && <button type="button" aria-label={`Remove band ${index + 1}`} onClick={() => setBands((current) => current.filter((_, i) => i !== index))} className="rounded-lg p-1.5 text-red-700 hover:bg-red-50"><Trash2 size={15}/></button>}</div>
          <div className="grid gap-3 sm:grid-cols-2"><div><label className={labelClass}>Starting quantity</label><input className={field} type="number" min="1" step="1" value={band.minQuantity} onChange={(event) => updateBand(index, "minQuantity", event.target.value)} /></div><div><label className={labelClass}>Price per piece (NGN)</label><input className={field} type="number" min="0.01" step="0.01" value={band.unitPrice} onChange={(event) => updateBand(index, "unitPrice", event.target.value)} placeholder="e.g. 750.00" /></div></div>
          <p className="mt-2 text-xs text-slate-500">{band.unitPrice && Number(band.unitPrice) > 0 ? money(band.unitPrice) : "Rate not set"} per piece</p>
        </div>;
      })}
    </div>
    <button type="button" onClick={() => {
      const last = bands[bands.length - 1];
      const nextMin = Math.max(1, Number(last?.minQuantity || 0) + 1);
      setBands((current) => [...current, { minQuantity: String(nextMin), unitPrice: "" }]);
      setNotice("");
    }} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-[#2A7F7F]/50 bg-white px-3 py-2 text-sm font-semibold text-[#2A7F7F]"><Plus size={15}/> Add quantity band</button>
    {validation && <p role="alert" className="mt-3 text-sm text-red-700">{validation}</p>}
    {save.isError && <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle size={16} className="mt-0.5 shrink-0"/><div><p>{save.error instanceof Error ? save.error.message : "Could not save pricing schedule."}</p><p className="mt-1 text-xs">If another administrator saved a newer version, reload before making further changes.</p><button type="button" onClick={() => { save.reset(); schedule.refetch(); }} className="mt-2 inline-flex items-center gap-1 font-semibold underline"><RefreshCw size={12}/> Reload latest schedule</button></div></div>}
    {notice && <p role="status" className="mt-3 text-sm font-medium text-emerald-800">{notice}</p>}
    <button type="button" disabled={Boolean(validation) || save.isPending || !bands.length} onClick={() => save.mutate()} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#17324D] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Save size={15}/>{save.isPending ? "Saving complete schedule…" : `Save complete schedule · v${currentVersion + 1}`}</button>
    <p className="mt-2 text-[11px] leading-5 text-slate-500">Saving creates a new version. Existing orders retain their original price snapshots. A product without a valid current schedule cannot be published or ordered.</p>
  </section>;
}
