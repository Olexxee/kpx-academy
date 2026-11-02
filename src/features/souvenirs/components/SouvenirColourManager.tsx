import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAdminSouvenirColorOption,
  updateAdminSouvenirColorOption,
  setAdminSouvenirColorOptionActive,
} from "../api";
import type { SouvenirProduct } from "../types";

const inputClass = "min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm";

export function SouvenirColourManager({ product }: { product: SouvenirProduct }) {
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState("#17324D");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingHex, setEditingHex] = useState("#17324D");
  const refresh = () => client.invalidateQueries({ queryKey: ["souvenirs"] });

  const create = useMutation({
    mutationFn: () => createAdminSouvenirColorOption(product.id, { name: name.trim(), colorHex }),
    onSuccess: async () => { setName(""); setColorHex("#17324D"); await refresh(); },
  });
  const update = useMutation({
    mutationFn: () => updateAdminSouvenirColorOption(editingId!, { name: editingName.trim(), colorHex: editingHex }),
    onSuccess: async () => { setEditingId(null); await refresh(); },
  });
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setAdminSouvenirColorOptionActive(id, active),
    onSuccess: refresh,
  });

  return <section className="border-t border-slate-100 bg-white p-3">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer colour options</p>
      <span className="text-xs text-slate-500">{product.colorOptions.length} configured</span>
    </div>
    <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_90px_auto]" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
      <input aria-label="Colour name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Colour name" className={inputClass}/>
      <input aria-label="Colour hex value" required pattern="^#[0-9A-Fa-f]{6}$" value={colorHex} onChange={(event) => setColorHex(event.target.value)} className={inputClass}/>
      <button type="submit" disabled={create.isPending} className="rounded-lg bg-[#1D4ED8] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{create.isPending ? "Adding…" : "Add colour"}</button>
    </form>
    <div className="mt-3 space-y-2">
      {product.colorOptions.map((color) => <div key={color.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 p-2">
        {editingId === color.id ? <>
          <input aria-label="Edit colour name" value={editingName} onChange={(event) => setEditingName(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"/>
          <input aria-label="Edit colour hex" value={editingHex} onChange={(event) => setEditingHex(event.target.value)} pattern="^#[0-9A-Fa-f]{6}$" className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"/>
          <button type="button" disabled={update.isPending} onClick={() => update.mutate()} className="text-xs font-semibold text-[#1D4ED8]">Save</button>
          <button type="button" onClick={() => setEditingId(null)} className="text-xs text-slate-500">Cancel</button>
        </> : <>
          <span aria-hidden="true" className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: color.colorHex }}/>
          <span className="min-w-0 flex-1 text-sm text-slate-800">{color.name} <span className="text-xs text-slate-400">{color.colorHex}</span></span>
          <button type="button" onClick={() => { setEditingId(color.id); setEditingName(color.name); setEditingHex(color.colorHex); }} className="text-xs font-semibold text-[#1D4ED8]">Edit</button>
          <button type="button" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: color.id, active: color.active === false })} className="text-xs font-semibold text-slate-600">{color.active === false ? "Activate" : "Deactivate"}</button>
        </>}
      </div>)}
      {!product.colorOptions.length && <p className="text-xs text-slate-500">No colours configured yet.</p>}
    </div>
    {(create.isError || update.isError || toggle.isError) && <p role="alert" className="mt-2 text-xs text-red-700">{(create.error ?? update.error ?? toggle.error)?.message || "Could not update colour options."}</p>}
    <p className="mt-2 text-xs text-slate-500">Inactive colours stay in historical orders but are not offered to new customers.</p>
  </section>;
}
