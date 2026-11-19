import { useRef, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  calculateLipCareFormulation,
  calculateManualMeasurements,
  getLipCarePercentageSummary,
  type ManualIngredientInput,
  type ManualMeasurementUnit,
  type LipCareIngredientInput,
} from "./calculations";

type ProductType = "Lip Gloss" | "Lip Balm" | "Lip Scrub";
type PercentageRow = LipCareIngredientInput & { id: number; percentageText: string };
type ManualRow = Omit<ManualIngredientInput, "unit"> & { id: number; quantityText: string; unit: ManualMeasurementUnit | "" };
const productOptions: ProductType[] = ["Lip Gloss", "Lip Balm", "Lip Scrub"];
const units: Array<[ManualMeasurementUnit, string]> = [
  ["g", "Grams (g)"], ["ml", "Millilitres (ml)"], ["tsp", "Teaspoons"], ["tbsp", "Tablespoons"], ["cup", "Cups"], ["drop", "Drops"],
];
const numberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 4 });
const fieldClass = "min-h-12 w-full rounded-xl border border-[#d8dfe3] bg-white px-3 py-2.5 text-sm text-[#212529] outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15";

export default function LipCareCalculator() {
  const nextId = useRef(2);
  const [product, setProduct] = useState<ProductType>("Lip Gloss");
  const [method, setMethod] = useState<"percentage" | "manual">("percentage");
  const [batchSize, setBatchSize] = useState("");
  const [percentageRows, setPercentageRows] = useState<PercentageRow[]>([
    { id: 1, name: "", percentage: 0, percentageText: "" },
  ]);
  const [manualRows, setManualRows] = useState<ManualRow[]>([
    { id: 1, name: "", quantity: 0, quantityText: "", unit: "" },
  ]);

  const addPercentageRow = () => setPercentageRows((rows) => [
    ...rows, { id: nextId.current++, name: "", percentage: 0, percentageText: "" },
  ]);
  const addManualRow = () => setManualRows((rows) => [
    ...rows, { id: nextId.current++, name: "", quantity: 0, quantityText: "", unit: "" },
  ]);
  const updatePercentage = (id: number, patch: Partial<PercentageRow>) =>
    setPercentageRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  const updateManual = (id: number, patch: Partial<ManualRow>) =>
    setManualRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));

  const parsedPercentageRows = percentageRows.map(({ name, percentageText }) => ({
    name,
    percentage: percentageText.trim() === "" ? NaN : Number(percentageText),
  }));
  const percentageSummary = getLipCarePercentageSummary(
    parsedPercentageRows.map((row) => ({ name: row.name, percentage: Number.isFinite(row.percentage) ? row.percentage : 0 })),
  );
  const batchValue = batchSize.trim() === "" ? NaN : Number(batchSize);
  const percentageRowsValid = percentageRows.length > 0
    && parsedPercentageRows.every((row) => row.name.trim() && Number.isFinite(row.percentage) && row.percentage > 0 && row.percentage <= 100);
  const percentageValid = Number.isFinite(batchValue) && batchValue > 0 && percentageRowsValid && percentageSummary.isBalanced;
  const percentageResult = percentageValid
    ? calculateLipCareFormulation(batchValue, parsedPercentageRows)
    : null;

  const parsedManualRows = manualRows.map(({ name, quantityText, unit }) => ({
    name,
    quantity: quantityText.trim() === "" ? NaN : Number(quantityText),
    unit,
  }));
  const manualValid = manualRows.length > 0
    && parsedManualRows.every((row) => row.name.trim() && Number.isFinite(row.quantity) && row.quantity > 0 && units.some(([unit]) => unit === row.unit));
  const manualResult = manualValid ? calculateManualMeasurements(parsedManualRows as ManualIngredientInput[]) : null;

  const reset = () => {
    setProduct("Lip Gloss");
    setMethod("percentage");
    setBatchSize("");
    setPercentageRows([{ id: nextId.current++, name: "", percentage: 0, percentageText: "" }]);
    setManualRows([{ id: nextId.current++, name: "", quantity: 0, quantityText: "", unit: "" }]);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8b1e5a]">Browser-only formulation calculations</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-[#1d4ed8]">Lip Care Formulation Calculator</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64717a]">Enter your own formulation. This calculator does not generate, suggest or prefill recipes.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-semibold text-[#212529]">Product type</span>
            <select value={product} onChange={(event) => setProduct(event.target.value as ProductType)} className={fieldClass}>
              {productOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <span className="mt-1.5 block text-xs leading-5 text-[#64717a]">This changes the product label only. It does not load or alter your ingredients or formulation.</span>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-semibold text-[#212529]">Calculation method</span>
            <select value={method} onChange={(event) => setMethod(event.target.value as "percentage" | "manual")} className={fieldClass}>
              <option value="percentage">Percentage-Based Formulation</option>
              <option value="manual">Manual Ingredient Measurement</option>
            </select>
            <span className="mt-1.5 block text-xs leading-5 text-[#64717a]">Choose how you want to enter your formulation. Use percentage-based calculation if your ingredients are already expressed in percentages, or manual measurement if you prefer to enter the quantities directly.</span>
          </label>
        </div>
      </section>

      {method === "percentage" ? (
        <>
          <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <h3 className="font-heading text-xl font-semibold text-[#1d4ed8]">Percentage-based formulation</h3>
              <p className="mt-1 text-sm leading-6 text-[#64717a]">Enter the total batch size and the percentages from your own verified formulation.</p>
            </div>
            <label className="block max-w-sm">
              <span className="mb-2 block text-sm font-semibold text-[#212529]">Total batch size (g)</span>
              <input type="number" min="0" step="any" inputMode="decimal" value={batchSize} onChange={(event) => setBatchSize(event.target.value)} placeholder="e.g. 100" className={fieldClass} />
              <span className="mt-1.5 block text-xs leading-5 text-[#64717a]">Enter the total quantity of your intended formulation in grams.</span>
            </label>
            <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
              <div><h4 className="font-semibold text-[#212529]">Your ingredients</h4><p className="mt-1 text-sm text-[#64717a]">Enter each ingredient name and its percentage in the complete formulation.</p></div>
              <button type="button" onClick={addPercentageRow} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8b1e5a]"><Plus size={16} aria-hidden="true" /> Add ingredient</button>
            </div>
            <div className="mt-4 space-y-3">
              {percentageRows.map((row, index) => (
                <div key={row.id} className="grid gap-3 rounded-xl border border-[#e7eceb] bg-[#faf8f5] p-3 sm:grid-cols-[minmax(0,1fr)_170px_48px] sm:items-end">
                  <label className="block min-w-0"><span className="mb-2 block text-xs font-semibold text-[#52616a]">Ingredient {index + 1}</span><input type="text" value={row.name} onChange={(event) => updatePercentage(row.id, { name: event.target.value })} placeholder="Enter ingredient name" className={fieldClass} /></label>
                  <label className="block min-w-0"><span className="mb-2 block text-xs font-semibold text-[#52616a]">Percentage (%)</span><input type="number" min="0" max="100" step="any" inputMode="decimal" value={row.percentageText} onChange={(event) => updatePercentage(row.id, { percentageText: event.target.value, percentage: event.target.value.trim() === "" ? 0 : Number(event.target.value) })} placeholder="e.g. 25" className={fieldClass} /><span className="mt-1 block text-xs leading-5 text-[#64717a]">Enter the percentage of this ingredient in your complete formulation.</span></label>
                  <button type="button" onClick={() => setPercentageRows((rows) => rows.filter((item) => item.id !== row.id))} aria-label={`Remove ingredient ${index + 1}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#f0cbdc] bg-white text-[#8b1e5a] transition hover:bg-[#fdf1f6]"><Trash2 size={17} aria-hidden="true" /></button>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#eef2ff] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#1d4ed8]">Total formulation</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#212529]">{numberFormat.format(percentageSummary.totalPercentage)}%</p></div>
              <div className={`rounded-xl p-4 ${percentageSummary.remainingPercentage > 0 ? "bg-amber-50" : "bg-[#f4dcd6]"}`}><p className="text-xs font-semibold uppercase tracking-wide text-[#64717a]">Remaining to 100%</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#212529]">{numberFormat.format(percentageSummary.remainingPercentage)}%</p></div>
              <div className={`rounded-xl p-4 ${percentageSummary.overagePercentage > 0 ? "bg-red-50" : "bg-[#f4dcd6]"}`}><p className="text-xs font-semibold uppercase tracking-wide text-[#64717a]">Excess above 100%</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#212529]">{numberFormat.format(percentageSummary.overagePercentage)}%</p></div>
            </div>
            <p className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${percentageSummary.isBalanced && percentageRowsValid ? "border-[#e7bfd0] bg-[#fdf1f6] text-[#68153f]" : "border-amber-200 bg-amber-50 text-amber-900"}`} role="status" aria-live="polite">
              {!percentageRowsValid ? "Enter a name and a positive percentage for every ingredient row." : percentageSummary.isBalanced ? "Your entered percentages total 100%." : percentageSummary.remainingPercentage > 0 ? `Your formulation is ${numberFormat.format(percentageSummary.remainingPercentage)}% below 100%.` : `Your formulation exceeds 100% by ${numberFormat.format(percentageSummary.overagePercentage)}%.`}
            </p>
          </section>

          <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7" aria-live="polite">
            <h3 className="font-heading text-xl font-semibold text-[#1d4ed8]">Percentage calculation results</h3>
            {percentageResult ? (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#eef2ff] p-4"><p className="text-xs font-semibold uppercase text-[#1d4ed8]">Product</p><p className="mt-2 font-bold text-[#212529]">{product}</p></div>
                  <div className="rounded-xl bg-[#f4dcd6] p-4"><p className="text-xs font-semibold uppercase text-[#64717a]">Total batch size</p><p className="mt-2 font-bold tabular-nums text-[#212529]">{numberFormat.format(percentageResult.batchSizeGrams)} g</p></div>
                  <div className="rounded-xl bg-[#fdf1f6] p-4"><p className="text-xs font-semibold uppercase text-[#8b1e5a]">Total calculated weight</p><p className="mt-2 font-bold tabular-nums text-[#212529]">{numberFormat.format(percentageResult.totalIngredientWeightGrams)} g</p></div>
                </div>
                <div className="mt-5 overflow-x-auto rounded-xl border border-[#e2e7e8]">
                  <table className="w-full min-w-[440px] text-left text-sm">
                    <thead className="bg-[#eef2ff] text-xs uppercase tracking-wide text-[#52616a]"><tr><th className="px-4 py-3">Ingredient</th><th className="px-4 py-3 text-right">Entered percentage</th><th className="px-4 py-3 text-right">Calculated quantity</th></tr></thead>
                    <tbody>{percentageResult.ingredients.map((item, index) => <tr key={`${item.name}-${index}`} className="border-t border-[#edf0f0]"><td className="px-4 py-3 font-medium text-[#212529]">{item.name}</td><td className="px-4 py-3 text-right tabular-nums">{numberFormat.format(item.percentage)}%</td><td className="px-4 py-3 text-right font-semibold tabular-nums">{numberFormat.format(item.grams)} g</td></tr>)}</tbody>
                    <tfoot className="border-t-2 border-[#dce5e4] bg-[#faf8f5] font-bold text-[#212529]"><tr><td className="px-4 py-3">Total</td><td className="px-4 py-3 text-right">{numberFormat.format(percentageResult.totalPercentage)}%</td><td className="px-4 py-3 text-right">{numberFormat.format(percentageResult.totalIngredientWeightGrams)} g</td></tr></tfoot>
                  </table>
                </div>
                <p className="mt-4 text-sm text-[#64717a]">Remaining percentage: {numberFormat.format(percentageSummary.remainingPercentage)}% · Excess percentage: {numberFormat.format(percentageSummary.overagePercentage)}%</p>
              </>
            ) : <p className="mt-4 rounded-xl border border-dashed border-[#cbd7d5] bg-[#faf8f5] p-5 text-sm leading-6 text-[#64717a]" role="status">Results appear when the batch size is positive, every ingredient row is complete and the percentages total exactly 100%.</p>}
          </section>
        </>
      ) : (
        <>
          <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-heading text-xl font-semibold text-[#1d4ed8]">Manual ingredient measurement</h3><p className="mt-1 text-sm leading-6 text-[#64717a]">Enter the quantities you measured. The calculator will not convert between units or assume ingredient densities.</p></div>
              <button type="button" onClick={addManualRow} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1d4ed8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8b1e5a]"><Plus size={16} aria-hidden="true" /> Add ingredient</button>
            </div>
            <div className="mt-4 space-y-3">
              {manualRows.map((row, index) => (
                <div key={row.id} className="grid gap-3 rounded-xl border border-[#e7eceb] bg-[#faf8f5] p-3 sm:grid-cols-[minmax(0,1fr)_130px_160px_48px] sm:items-end">
                  <label className="block min-w-0"><span className="mb-2 block text-xs font-semibold text-[#52616a]">Ingredient {index + 1}</span><input type="text" value={row.name} onChange={(event) => updateManual(row.id, { name: event.target.value })} placeholder="Enter ingredient name" className={fieldClass} /></label>
                  <label className="block min-w-0"><span className="mb-2 block text-xs font-semibold text-[#52616a]">Ingredient quantity</span><input type="number" min="0" step="any" inputMode="decimal" value={row.quantityText} onChange={(event) => updateManual(row.id, { quantityText: event.target.value, quantity: event.target.value.trim() === "" ? 0 : Number(event.target.value) })} placeholder="e.g. 5" className={fieldClass} /><span className="mt-1 block text-xs leading-5 text-[#64717a]">Enter the quantity of this ingredient using your preferred measurement unit.</span></label>
                  <label className="block min-w-0"><span className="mb-2 block text-xs font-semibold text-[#52616a]">Measurement unit</span><select value={row.unit} onChange={(event) => updateManual(row.id, { unit: event.target.value as ManualMeasurementUnit | "" })} className={fieldClass}><option value="">Select a unit</option>{units.map(([unit, label]) => <option key={unit} value={unit}>{label}</option>)}</select><span className="mt-1 block text-xs leading-5 text-[#64717a]">Select the unit you used to measure this ingredient.</span></label>
                  <button type="button" onClick={() => setManualRows((rows) => rows.filter((item) => item.id !== row.id))} aria-label={`Remove ingredient ${index + 1}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#f0cbdc] bg-white text-[#8b1e5a] transition hover:bg-[#fdf1f6]"><Trash2 size={17} aria-hidden="true" /></button>
                </div>
              ))}
            </div>
            {!manualValid && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">Enter a name, a positive quantity and a measurement unit for every ingredient row to calculate the manual measurements.</p>}
          </section>

          <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7" aria-live="polite">
            <h3 className="font-heading text-xl font-semibold text-[#1d4ed8]">Manual measurement results</h3>
            {manualResult ? (
              <>
                <div className="mt-5 overflow-x-auto rounded-xl border border-[#e2e7e8]">
                  <table className="w-full min-w-[400px] text-left text-sm">
                    <thead className="bg-[#eef2ff] text-xs uppercase tracking-wide text-[#52616a]"><tr><th className="px-4 py-3">Ingredient</th><th className="px-4 py-3 text-right">Entered quantity</th><th className="px-4 py-3">Measurement unit</th></tr></thead>
                    <tbody>{manualResult.ingredients.map((item, index) => <tr key={`${item.name}-${index}`} className="border-t border-[#edf0f0]"><td className="px-4 py-3 font-medium text-[#212529]">{item.name}</td><td className="px-4 py-3 text-right tabular-nums">{numberFormat.format(item.quantity)}</td><td className="px-4 py-3">{units.find(([unit]) => unit === item.unit)?.[1]}</td></tr>)}</tbody>
                  </table>
                </div>
                <h4 className="mt-6 font-semibold text-[#212529]">Subtotals by measurement unit</h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {units.map(([unit, label]) => <div key={unit} className="rounded-xl bg-[#faf8f5] p-4"><p className="text-xs font-semibold text-[#64717a]">{label}</p><p className="mt-2 text-xl font-bold tabular-nums text-[#1d4ed8]">{numberFormat.format(manualResult.subtotals[unit])}</p></div>)}
                </div>
                <p className="mt-4 text-xs leading-5 text-[#64717a]">Subtotals are grouped only by matching units. They are not combined into a total weight or volume.</p>
              </>
            ) : <p className="mt-4 rounded-xl border border-dashed border-[#cbd7d5] bg-[#faf8f5] p-5 text-sm leading-6 text-[#64717a]" role="status">Complete every ingredient row with a name, positive quantity and unit to display your manual measurements.</p>}
          </section>
        </>
      )}

      <section className="rounded-2xl border border-[#e7bfd0] bg-[#fdf1f6] p-5 text-sm leading-6 text-[#68153f] sm:p-6">
        <h3 className="font-semibold">Formulation accuracy and safety</h3>
        <p className="mt-2">This calculator performs formulation quantity calculations based on the information you provide. It does not verify ingredient compatibility, cosmetic safety, recommended usage concentrations or suitability for lip application. Always use verified formulation guidance, supplier documentation and applicable cosmetic safety requirements before preparing or using a product.</p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-[#64717a]">Your entries remain in this page's memory only. They are not saved or sent to KPX Academy.</p>
        <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cbd7d5] bg-white px-5 py-3 text-sm font-semibold text-[#212529] transition hover:bg-[#f4dcd6]"><RotateCcw size={16} aria-hidden="true" /> Reset formulation</button>
      </div>
    </div>
  );
}
