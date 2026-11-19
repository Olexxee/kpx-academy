import { useRef, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { calculateLipCareFormulation, getLipCarePercentageSummary, type LipCareIngredientInput } from "./calculations";

type IngredientRow = LipCareIngredientInput & { id: number };
type ProductType = "Lip Gloss" | "Lip Balm" | "Lip Scrub";
const productOptions: ProductType[] = ["Lip Gloss", "Lip Balm", "Lip Scrub"];
const numberFormat = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 2 });
const gramsFormat = new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
const fieldClass = "min-h-12 w-full rounded-xl border border-[#d8dfe3] bg-white px-3 py-2.5 text-sm text-[#212529] outline-none transition focus:border-[#2A7F7F] focus:ring-2 focus:ring-[#2A7F7F]/15";

export default function LipCareCalculator() {
  const nextId = useRef(2);
  const [product, setProduct] = useState<ProductType>("Lip Gloss");
  const [batchSize, setBatchSize] = useState("100");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ id: 1, name: "", percentage: 0 }]);
  const updateIngredient = (id: number, patch: Partial<LipCareIngredientInput>) =>
    setIngredients((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  const addIngredient = () => {
    const id = nextId.current++;
    setIngredients((current) => [...current, { id, name: "", percentage: 0 }]);
  };
  const removeIngredient = (id: number) => {
    setIngredients((current) => current.filter((row) => row.id !== id));
  };
  const reset = () => {
    setProduct("Lip Gloss");
    setBatchSize("100");
    setIngredients([{ id: nextId.current++, name: "", percentage: 0 }]);
  };

  const numericRows = ingredients.map(({ name, percentage }) => ({ name, percentage }));
  const summary = getLipCarePercentageSummary(numericRows);
  const batchValue = batchSize.trim() === "" ? NaN : Number(batchSize);
  const hasNamedRows = ingredients.every((row) => row.name.trim().length > 0);
  const canCalculate = Number.isFinite(batchValue) && batchValue > 0 && ingredients.length > 0 && hasNamedRows
    && ingredients.every((row) => Number.isFinite(row.percentage) && row.percentage >= 0 && row.percentage <= 100)
    && summary.isBalanced;
  const calculation = canCalculate ? calculateLipCareFormulation(batchValue, numericRows) : null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2A7F7F]">Browser-only formulation maths</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-[#17324D]">Lip Care Formulation Calculator</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#64717a]">Choose the product category, enter your own batch size and add the ingredients and percentages from your verified formulation. Nothing is pre-filled as a recipe.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-semibold text-[#17324D]">Product type</span>
            <select value={product} onChange={(event) => setProduct(event.target.value as ProductType)} className={fieldClass}>
              {productOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <span className="mt-1.5 block text-xs leading-5 text-[#64717a]">This is a label only. Changing it does not load or alter a formula.</span>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-semibold text-[#17324D]">Total batch size (g)</span>
            <input type="number" min="0" step="any" inputMode="decimal" value={batchSize} onChange={(event) => setBatchSize(event.target.value)} className={fieldClass} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div><h3 className="font-heading text-xl font-semibold text-[#17324D]">Your ingredients</h3><p className="mt-1 text-sm leading-6 text-[#64717a]">Add every ingredient in your formulation. The calculator only converts the percentages you supply into grams.</p></div>
          <button type="button" onClick={addIngredient} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#17324D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2A7F7F]"><Plus size={16} aria-hidden="true" /> Add ingredient</button>
        </div>
        <div className="space-y-3">
          {ingredients.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-xl border border-[#e7eceb] bg-[#fbfcfb] p-3 sm:grid-cols-[minmax(0,1fr)_170px_48px] sm:items-end">
              <label className="block min-w-0"><span className="mb-2 block text-xs font-semibold text-[#52616a]">Ingredient {index + 1}</span><input type="text" value={row.name} onChange={(event) => updateIngredient(row.id, { name: event.target.value })} placeholder="Enter ingredient name" className={fieldClass} /></label>
              <label className="block min-w-0"><span className="mb-2 block text-xs font-semibold text-[#52616a]">Percentage (%)</span><input type="number" min="0" max="100" step="any" inputMode="decimal" value={row.percentage} onChange={(event) => updateIngredient(row.id, { percentage: event.target.value === "" ? 0 : Number(event.target.value) })} className={fieldClass} /></label>
              <button type="button" onClick={() => removeIngredient(row.id)} aria-label={`Remove ingredient ${index + 1}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 transition hover:bg-red-50"><Trash2 size={17} aria-hidden="true" /></button>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#edf1f7] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#62728b]">Total percentage</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#17324D]">{numberFormat.format(summary.totalPercentage)}%</p></div>
          <div className={`rounded-xl p-4 ${summary.remainingPercentage > 0 ? "bg-amber-50" : "bg-[#eaf3f1]"}`}><p className="text-xs font-semibold uppercase tracking-wide text-[#64717a]">Remaining to 100%</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#17324D]">{numberFormat.format(summary.remainingPercentage)}%</p></div>
          <div className={`rounded-xl p-4 ${summary.overagePercentage > 0 ? "bg-red-50" : "bg-[#eaf3f1]"}`}><p className="text-xs font-semibold uppercase tracking-wide text-[#64717a]">Over 100%</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#17324D]">{numberFormat.format(summary.overagePercentage)}%</p></div>
        </div>
        <div className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${summary.isBalanced && hasNamedRows ? "border-[#b7d7cd] bg-[#eaf3f1] text-[#205b4d]" : "border-amber-200 bg-amber-50 text-amber-900"}`} role="status" aria-live="polite">
          {summary.isBalanced && hasNamedRows ? "Percentage total is complete at 100%." : summary.remainingPercentage > 0 ? `Add ${numberFormat.format(summary.remainingPercentage)}% to complete the formulation.` : summary.overagePercentage > 0 ? `Reduce the formulation by ${numberFormat.format(summary.overagePercentage)}% to reach 100%.` : "Enter an ingredient name and percentages that total exactly 100%."}
        </div>
      </section>

      <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7" aria-live="polite">
        <div className="mb-5"><h3 className="font-heading text-xl font-semibold text-[#17324D]">Calculated formulation</h3><p className="mt-1 text-sm leading-6 text-[#64717a]">The gram quantities below are calculated from your batch size and percentages.</p></div>
        {calculation ? (
          <div>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#eaf3f1] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#55716c]">Product</p><p className="mt-2 text-lg font-bold text-[#17324D]">{product}</p></div>
              <div className="rounded-xl bg-[#edf1f7] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#62728b]">Batch size</p><p className="mt-2 text-lg font-bold tabular-nums text-[#17324D]">{numberFormat.format(calculation.batchSizeGrams)} g</p></div>
              <div className="rounded-xl bg-[#f8edf2] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#8c5570]">Total ingredient weight</p><p className="mt-2 text-lg font-bold tabular-nums text-[#17324D]">{gramsFormat.format(calculation.totalIngredientWeightGrams)} g</p></div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#e2e7e8]">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-[#f1f6f5] text-xs uppercase tracking-wide text-[#52616a]"><tr><th className="px-4 py-3">Ingredient</th><th className="px-4 py-3 text-right">Percentage</th><th className="px-4 py-3 text-right">Weight</th></tr></thead>
                <tbody>{calculation.ingredients.map((ingredient, index) => <tr key={`${ingredient.name}-${index}`} className="border-t border-[#edf0f0]"><td className="px-4 py-3 font-medium text-[#17324D]">{ingredient.name}</td><td className="px-4 py-3 text-right tabular-nums">{numberFormat.format(ingredient.percentage)}%</td><td className="px-4 py-3 text-right font-semibold tabular-nums">{gramsFormat.format(ingredient.grams)} g</td></tr>)}</tbody>
                <tfoot className="border-t-2 border-[#dce5e4] bg-[#fbfcfb] font-bold text-[#17324D]"><tr><td className="px-4 py-3">Total</td><td className="px-4 py-3 text-right tabular-nums">{numberFormat.format(calculation.totalPercentage)}%</td><td className="px-4 py-3 text-right tabular-nums">{gramsFormat.format(calculation.totalIngredientWeightGrams)} g</td></tr></tfoot>
              </table>
            </div>
          </div>
        ) : <div className="rounded-xl border border-dashed border-[#cbd7d5] bg-[#f7faf9] p-5 text-sm leading-6 text-[#64717a]" role="status"><p className="font-semibold text-[#17324D]">A complete formulation will appear here.</p><p className="mt-1">Enter a valid batch size, name every ingredient and make the percentages total 100%.</p></div>}
        <p className="mt-5 rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">This calculator performs mathematical formulation calculations only. It does not create, verify or approve recipes. Always use a properly verified formulation and check ingredient suitability, usage limits, compatibility, preservation requirements and applicable product safety standards before preparing or selling lip care products.</p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs leading-5 text-[#64717a]">Your entries remain in this page's memory only. They are not saved or sent to KPX Academy.</p><button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cbd7d5] bg-white px-5 py-3 text-sm font-semibold text-[#17324D] transition hover:bg-[#edf4f2]"><RotateCcw size={16} aria-hidden="true" /> Reset formulation</button></div>
    </div>
  );
}
