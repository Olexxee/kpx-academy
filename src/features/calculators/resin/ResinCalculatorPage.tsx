import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calculator, RotateCcw, ShieldCheck } from "lucide-react";
import LipCareCalculator from "../lip-care/LipCareCalculator";
import {
  calculateResinProject,
  type MouldShape,
  type PurchaseMethod,
  type PurchaseUnit,
  type RatioBasis,
  type ResinCalculatorInput,
} from "./calculations";

type FormValues = Record<string, string>;
const initialValues: FormValues = {
  projectName: "", shape: "round", unit: "cm", diameter: "", length: "", width: "", depth: "",
  waterCapacityMl: "", cavitiesPerMould: "1", orderQuantity: "1", allowancePercent: "10",
  ratioBasis: "volume", resinRatioParts: "", hardenerRatioParts: "", mixedSystemDensity: "",
  purchaseMethod: "separate", resinPurchaseQuantity: "", resinPurchaseUnit: "ml", resinPurchasePrice: "",
  hardenerPurchaseQuantity: "", hardenerPurchaseUnit: "ml", hardenerPurchasePrice: "",
  resinDensity: "", hardenerDensity: "", combinedPurchasePrice: "",
  accessories: "0", pigments: "0", decorative: "0", customisation: "0", packaging: "0", labourOther: "0",
  costPerMould: "0", mouldsUsed: "1", mouldAllocationPercent: "2", sellingPricePerPiece: "",
};
const expenseFields = [
  ["accessories", "Accessories", "Key rings, chains, hooks, fittings and hardware used for this order."],
  ["pigments", "Pigments and Colours", "The value of pigments, dyes and colourants consumed by this project."],
  ["decorative", "Decorative Add-ons", "Glitter, flakes, beads, dried flowers and other decorative inserts used."],
  ["customisation", "Customisation", "Names, letters, photographs, engraving and personalisation work."],
  ["packaging", "Packaging and Finishing", "Boxes, pouches, labels, sanding, polishing and finishing materials consumed."],
  ["labourOther", "Labour and Other Expenses", "Labour, electricity, transport and other project-specific costs."],
] as const;
const combinations = [
  { a: "Red", b: "Yellow", result: "Orange", colors: ["#e34c4c", "#f4cf45", "#ef8a32"] },
  { a: "Blue", b: "Yellow", result: "Green", colors: ["#3478d4", "#f4cf45", "#3e9b62"] },
  { a: "Red", b: "Blue", result: "Purple", colors: ["#e34c4c", "#3478d4", "#8755b5"] },
  { a: "Red", b: "White", result: "Pink", colors: ["#e34c4c", "#ffffff", "#e98cae"] },
  { a: "Blue", b: "White", result: "Light Blue", colors: ["#3478d4", "#ffffff", "#91c9ed"] },
  { a: "Black", b: "White", result: "Grey", colors: ["#222222", "#ffffff", "#888888"] },
  { a: "Purple", b: "White", result: "Lavender", colors: ["#8755b5", "#ffffff", "#c5a9df"] },
  { a: "Green", b: "White", result: "Mint Green", colors: ["#3e9b62", "#ffffff", "#a6dfc1"] },
  { a: "Yellow", b: "White", result: "Pale Yellow", colors: ["#f4cf45", "#ffffff", "#fff0a8"] },
];
const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(value);
const quantity = (value: number) => new Intl.NumberFormat("en-NG", { maximumFractionDigits: 3 }).format(value);
const inputClass = "min-h-12 w-full rounded-xl border border-[#d8dfe3] bg-white px-3 py-2.5 text-sm text-[#212529] outline-none transition focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/15";

function Field({ label, name, value, onChange, hint, type = "number", min = "0", max, required = false }: {
  label: string; name: string; value: string; onChange: (name: string, value: string) => void;
  hint?: string; type?: string; min?: string; max?: string; required?: boolean;
}) {
  return <label className="block min-w-0">
    <span className="mb-2 block text-sm font-semibold text-[#212529]">{label}{required && " *"}</span>
    <input type={type} inputMode={type === "number" ? "decimal" : undefined} min={min} max={max} step="any" value={value} onChange={(event) => onChange(name, event.target.value)} className={inputClass} />
    {hint && <span className="mt-1.5 block text-xs leading-5 text-[#64717a]">{hint}</span>}
  </label>;
}
function SelectField({ label, name, value, onChange, options, hint }: {
  label: string; name: string; value: string; onChange: (name: string, value: string) => void;
  options: Array<[string, string]>; hint?: string;
}) {
  return <label className="block min-w-0">
    <span className="mb-2 block text-sm font-semibold text-[#212529]">{label}</span>
    <select value={value} onChange={(event) => onChange(name, event.target.value)} className={inputClass}>
      {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
    </select>
    {hint && <span className="mt-1.5 block text-xs leading-5 text-[#64717a]">{hint}</span>}
  </label>;
}
function Section({ number, title, description, children }: { number: string; title: string; description?: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7">
    <div className="mb-6 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-sm font-bold text-[#1d4ed8]">{number}</span>
      <div><h2 className="font-heading text-xl font-semibold text-[#1d4ed8]">{title}</h2>{description && <p className="mt-1 text-sm leading-6 text-[#64717a]">{description}</p>}</div>
    </div>
    {children}
  </section>;
}
function ResultLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex items-start justify-between gap-4 py-3 ${strong ? "border-t border-[#dce5e4] font-bold text-[#212529]" : "border-b border-[#edf0f0] text-[#52616a]"}`}>
    <span className="text-sm">{label}</span><span className="text-right text-sm tabular-nums">{value}</span>
  </div>;
}

export default function ResinCalculatorPage() {
  const [activeCalculator, setActiveCalculator] = useState<"resin" | "lip-care">("resin");
  const [values, setValues] = useState<FormValues>(initialValues);
  const [colourA, setColourA] = useState("Red");
  const [colourB, setColourB] = useState("Yellow");
  const update = (name: string, value: string) => setValues((current) => ({ ...current, [name]: value }));
  const numeric = (name: string) => values[name]?.trim() === "" ? Number.NaN : Number(values[name]);
  const basis = values.ratioBasis as RatioBasis;
  const basisUnit = basis === "weight" ? "g" : "ml";
  const purchaseMethod = values.purchaseMethod as PurchaseMethod;
  const resinPurchaseUnit = values.resinPurchaseUnit as PurchaseUnit;
  const hardenerPurchaseUnit = values.hardenerPurchaseUnit as PurchaseUnit;

  const calculation = useMemo(() => {
    const input: ResinCalculatorInput = {
      shape: values.shape as MouldShape,
      unit: values.unit as ResinCalculatorInput["unit"],
      diameter: numeric("diameter"), length: numeric("length"), width: numeric("width"), depth: numeric("depth"),
      waterCapacityMl: numeric("waterCapacityMl"),
      cavitiesPerMould: numeric("cavitiesPerMould"), mouldsUsed: numeric("mouldsUsed"), orderQuantity: numeric("orderQuantity"),
      allowancePercent: numeric("allowancePercent"), ratioBasis: basis,
      resinRatioParts: numeric("resinRatioParts"), hardenerRatioParts: numeric("hardenerRatioParts"),
      mixedSystemDensity: values.mixedSystemDensity.trim() ? numeric("mixedSystemDensity") : undefined,
      resinDensity: values.resinDensity.trim() ? numeric("resinDensity") : undefined,
      hardenerDensity: values.hardenerDensity.trim() ? numeric("hardenerDensity") : undefined,
      purchaseMethod,
      resinPurchaseQuantity: numeric("resinPurchaseQuantity"), resinPurchaseUnit, resinPurchasePrice: numeric("resinPurchasePrice"),
      hardenerPurchaseQuantity: numeric("hardenerPurchaseQuantity"), hardenerPurchaseUnit, hardenerPurchasePrice: numeric("hardenerPurchasePrice"),
      combinedPurchasePrice: numeric("combinedPurchasePrice"),
      expenses: {
        accessories: numeric("accessories"), pigments: numeric("pigments"), decorative: numeric("decorative"),
        customisation: numeric("customisation"), packaging: numeric("packaging"), labourOther: numeric("labourOther"),
      },
      costPerMould: numeric("costPerMould"), mouldAllocationPercent: numeric("mouldAllocationPercent"),
      sellingPricePerPiece: values.sellingPricePerPiece.trim() ? numeric("sellingPricePerPiece") : undefined,
    };
    try { return { result: calculateResinProject(input), error: "" }; }
    catch (error) { return { result: null, error: error instanceof Error ? error.message : "Complete the required fields to calculate your estimate." }; }
    // Inputs are deliberately held only in component state; there is no persistence or API call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const result = calculation.result;
  const isIrregular = values.shape === "irregular";
  const isRound = values.shape === "round";
  const densityNeeded = (unit: PurchaseUnit) => unit !== basisUnit;
  const selectedCombination = combinations.find((item) => (item.a === colourA && item.b === colourB) || (item.a === colourB && item.b === colourA));
  const reset = () => {
    if (window.confirm("Reset all resin calculator entries?")) {
      setValues(initialValues);
      setColourA("Red");
      setColourB("Yellow");
    }
  };

  return <div className="bg-[#faf8f5] pb-20">
    <div className="bg-[#1d4ed8] px-4 py-12 text-white sm:py-16">
      <div className="mx-auto max-w-6xl">
        <Link to="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"><ArrowLeft size={16} aria-hidden="true" /> Back to learning resources</Link>
        <div className="mt-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4dcd6]">KPX Academy · Practical project planning</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">Resin &amp; Lip Care Formulation Calculators</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/90">Estimate resin quantities, production rounds and project costs, or convert your own lip care formulation into measured quantities.</p>
          <p className="mt-3 text-sm text-white/80">All calculations run in this browser. Your entries are not saved or sent to KPX Academy.</p>
        </div>
      </div>
    </div>

    <div className="mx-auto max-w-6xl px-4 pt-6">
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e2e7e8] bg-white p-2 shadow-sm" role="group" aria-label="Choose a calculator">
        <button type="button" aria-pressed={activeCalculator === "resin"} onClick={() => setActiveCalculator("resin")} className={`min-h-12 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeCalculator === "resin" ? "bg-[#1d4ed8] text-white shadow-sm" : "text-[#52616a] hover:bg-[#eef2ff]"}`}>Resin Calculator</button>
        <button type="button" aria-pressed={activeCalculator === "lip-care"} onClick={() => setActiveCalculator("lip-care")} className={`min-h-12 rounded-xl px-3 py-3 text-sm font-semibold transition ${activeCalculator === "lip-care" ? "bg-[#1d4ed8] text-white shadow-sm" : "text-[#52616a] hover:bg-[#eef2ff]"}`}>Lip Care Formulation</button>
      </div>
    </div>

    <section aria-labelledby="calculator-overview" className="mx-auto max-w-6xl px-4 pt-8">
      <div className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7">
        <h2 id="calculator-overview" className="font-heading text-xl font-semibold text-[#1d4ed8]">What you can calculate</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div><h3 className="font-semibold text-[#212529]">Resin quantity and project cost</h3><p className="mt-2 text-sm leading-6 text-[#52616a]">Calculate mould capacity, production rounds, material quantities, consumed material costs, project expenses and estimated profit.</p></div>
          <div><h3 className="font-semibold text-[#212529]">Lip care formulation quantities</h3><p className="mt-2 text-sm leading-6 text-[#52616a]">Calculate your own percentage-based formulation or record manual ingredient measurements without unsupported unit conversions.</p></div>
        </div>
        <p className="mt-5 border-t border-[#e7eceb] pt-4 text-xs leading-5 text-[#64717a]">Both tools calculate from values you enter. They do not generate recipes or replace manufacturer instructions and verified safety guidance.</p>
      </div>
    </section>

    <div className={activeCalculator === "resin" ? "block" : "hidden"}><div className="mx-auto grid max-w-6xl gap-7 px-4 pt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-6">
        <div className="sticky top-20 z-20 rounded-2xl bg-[#1d4ed8] p-4 text-white shadow-md lg:hidden" aria-live="polite">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f4dcd6]">Live estimate</p>
          <p className="mt-1 text-xs text-white/80">Total project cost</p>
          <p className="text-xl font-bold tabular-nums">{result ? money(result.totalOrderCost) : "—"}</p>
          {!result && <p className="mt-1 text-xs leading-5 text-white/85">{calculation.error}</p>}
        </div>

        <Section number="01" title="Project Information" description="Name the project and enter the number of finished pieces ordered.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Project name or description (optional)" name="projectName" value={values.projectName} onChange={update} type="text" />
            <Field label="Total order quantity (pieces)" name="orderQuantity" value={values.orderQuantity} onChange={update} min="1" required hint="Enter the total number of finished pieces requested." />
          </div>
        </Section>

        <Section number="02" title="Mould Measurement" description="Enter the dimensions of one cavity. Measurements are used to estimate the material for each finished piece.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Mould shape" name="shape" value={values.shape} onChange={update} options={[["round", "Round / Circular"], ["square", "Square"], ["rectangle", "Rectangular"], ["oval", "Oval"], ["irregular", "Irregular / Other"]]} />
            <SelectField label="Measurement unit" name="unit" value={values.unit} onChange={update} options={[["cm", "Centimetres (cm)"], ["mm", "Millimetres (mm)"], ["in", "Inches (in)"]]} />
            {isIrregular ? <Field label="Water capacity of one cavity (ml)" name="waterCapacityMl" value={values.waterCapacityMl} onChange={update} required hint="Measure one cavity only. Empty and dry the mould completely before using resin." /> : <>
              {isRound ? <Field label={`Diameter (${values.unit})`} name="diameter" value={values.diameter} onChange={update} required /> : <Field label={`Length (${values.unit})`} name="length" value={values.length} onChange={update} required />}
              {!isRound && <Field label={`Width (${values.unit})`} name="width" value={values.width} onChange={update} required />}
              <Field label={`Depth (${values.unit})`} name="depth" value={values.depth} onChange={update} required />
            </>}
            <Field label="Number of cavities per mould" name="cavitiesPerMould" value={values.cavitiesPerMould} onChange={update} min="1" required hint="Count the individual cavities inside one mould." />
          </div>
          {isIrregular && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">After measuring with water, empty the mould and allow it to dry completely before using resin.</p>}
          <p className="mt-4 text-xs leading-5 text-[#64717a]">For geometric estimates, 1 cm³ is treated as 1 ml. The calculator estimates one cavity, not the whole mould.</p>
        </Section>

        <Section number="03" title="Resin Measurement & Mixing Ratio" description="Use the exact ratio and measurement basis printed in your resin manufacturer's instructions.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Ratio basis" name="ratioBasis" value={values.ratioBasis} onChange={update} options={[["weight", "By Weight (g)"], ["volume", "By Volume (ml)"]]} hint="A weight-based ratio must not be treated as a volume-based ratio." />
            <Field label="Resin ratio parts" name="resinRatioParts" value={values.resinRatioParts} onChange={update} min="0.000001" required hint="Enter the resin part from the manufacturer's ratio." />
            <Field label="Hardener ratio parts" name="hardenerRatioParts" value={values.hardenerRatioParts} onChange={update} min="0.000001" required hint="Enter the hardener part from the manufacturer's ratio." />
            <Field label="Extra material allowance (%)" name="allowancePercent" value={values.allowancePercent} onChange={update} min="0" required hint="Applied once to the total order material requirement. Set to 0% if not needed." />
            {basis === "weight" && <Field label="Mixed-system density (g/ml)" name="mixedSystemDensity" value={values.mixedSystemDensity} onChange={update} min="0.000001" required hint="No universal density is assumed. Enter the verified mixed-system density from your resin manufacturer; any sample value must be treated as provisional." />}
          </div>
          <p className="mt-4 rounded-xl border border-[#f0cbdc] bg-[#fdf1f6] p-4 text-sm leading-6 text-[#68153f]">Enter the manufacturer's ratio exactly as stated, for example resin 2 parts and hardener 1 part. Do not convert a volume ratio to a weight ratio. Density is used only when a volume-to-weight or weight-to-volume conversion is required.</p>
        </Section>

        <Section number="04" title="Resin & Hardener Purchase Information" description="Choose how you buy the materials. Costs are based on the quantity consumed by this project, not the full package price.">
          <SelectField label="Purchase method" name="purchaseMethod" value={values.purchaseMethod} onChange={update} options={[["separate", "Purchased Separately"], ["combined", "Purchased Together (Combined Kit)"]]} />
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-[#e4e9e8] p-4">
              <h3 className="font-semibold text-[#1d4ed8]">{purchaseMethod === "combined" ? "Resin quantity in kit" : "Resin purchase"}</h3>
              <Field label={`Resin quantity (${resinPurchaseUnit})`} name="resinPurchaseQuantity" value={values.resinPurchaseQuantity} onChange={update} required hint="Enter the resin quantity in the package." />
              <SelectField label="Resin quantity unit" name="resinPurchaseUnit" value={values.resinPurchaseUnit} onChange={update} options={[["g", "Grams (g)"], ["ml", "Millilitres (ml)"]]} />
              {purchaseMethod === "separate" && <Field label="Resin purchase price (₦)" name="resinPurchasePrice" value={values.resinPurchasePrice} onChange={update} required />}
              {densityNeeded(resinPurchaseUnit) && <Field label="Verified resin density (g/ml)" name="resinDensity" value={values.resinDensity} onChange={update} min="0.000001" required hint="Required because the resin purchase unit differs from the selected ratio basis. Use your product's verified component density." />}
            </div>
            <div className="space-y-4 rounded-xl border border-[#e4e9e8] p-4">
              <h3 className="font-semibold text-[#1d4ed8]">{purchaseMethod === "combined" ? "Hardener quantity in kit" : "Hardener purchase"}</h3>
              <Field label={`Hardener quantity (${hardenerPurchaseUnit})`} name="hardenerPurchaseQuantity" value={values.hardenerPurchaseQuantity} onChange={update} required hint="Enter the hardener quantity in the package." />
              <SelectField label="Hardener quantity unit" name="hardenerPurchaseUnit" value={values.hardenerPurchaseUnit} onChange={update} options={[["g", "Grams (g)"], ["ml", "Millilitres (ml)"]]} />
              {purchaseMethod === "separate" && <Field label="Hardener purchase price (₦)" name="hardenerPurchasePrice" value={values.hardenerPurchasePrice} onChange={update} required />}
              {densityNeeded(hardenerPurchaseUnit) && <Field label="Verified hardener density (g/ml)" name="hardenerDensity" value={values.hardenerDensity} onChange={update} min="0.000001" required hint="Required because the hardener purchase unit differs from the selected ratio basis. Use your product's verified component density." />}
            </div>
          </div>
          {purchaseMethod === "combined" && <div className="mt-5 max-w-sm"><Field label="Total combined kit purchase price (₦)" name="combinedPurchasePrice" value={values.combinedPurchasePrice} onChange={update} required hint="The calculator allocates only the consumed share of the combined kit cost." /></div>}
          <p className="mt-4 text-xs leading-5 text-[#64717a]">If a purchase unit differs from the ratio basis, enter the relevant component density. Mixed-system density is not a substitute for resin-specific or hardener-specific density.</p>
        </Section>

        <Section number="05" title="Additional Project Expenses" description="Enter the amount spent or estimated value consumed for this project. Do not enter the full retail cost of supplies that are only partly used.">
          <div className="grid gap-4 sm:grid-cols-2">
            {expenseFields.map(([name, label, hint]) => <Field key={name} label={`${label} (₦)`} name={name} value={values[name]} onChange={update} hint={hint} />)}
          </div>
        </Section>

        <Section number="06" title="Mould Cost Allocation" description="Allocate a portion of the moulds actually used to this project. Production rounds do not multiply mould costs.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cost of one mould (₦)" name="costPerMould" value={values.costPerMould} onChange={update} required />
            <Field label="Number of moulds used" name="mouldsUsed" value={values.mouldsUsed} onChange={update} min="1" required hint="This is the number of physical moulds used at the same time, not the number of pouring rounds." />
            <Field label="Mould cost allocation percentage (%)" name="mouldAllocationPercent" value={values.mouldAllocationPercent} onChange={update} min="0" max="100" required hint="Editable allocation percentage applied to the total cost of moulds used." />
          </div>
        </Section>

        <Section number="07" title="Selling Price" description="Enter your selling price per finished piece to calculate projected sales and profit.">
          <div className="max-w-sm"><Field label="Selling price per piece (₦)" name="sellingPricePerPiece" value={values.sellingPricePerPiece} onChange={update} hint="Leave blank if you are not estimating sales yet." /></div>
        </Section>

        <Section number="08" title="Calculation Results" description="Results update automatically when valid inputs change. Quantities and money are shown separately.">
          {result ? <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#eef2ff] p-4"><p className="text-xs font-semibold uppercase text-[#1d4ed8]">Total project cost</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#212529]">{money(result.totalOrderCost)}</p></div>
              <div className="rounded-xl bg-[#f4dcd6] p-4"><p className="text-xs font-semibold uppercase text-[#68153f]">Cost per piece</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#212529]">{money(result.costPerPiece)}</p></div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold text-[#1d4ed8]">Material and production quantities</h3>
                <ResultLine label="Estimated resin volume required" value={`${quantity(result.totalVolumeMl)} ml`} />
                <ResultLine label="Estimated resin quantity required" value={`${quantity(result.resinQuantity)} ${result.quantityUnit}`} />
                <ResultLine label="Estimated hardener quantity required" value={`${quantity(result.hardenerQuantity)} ${result.quantityUnit}`} />
                <ResultLine label="Total mixed resin quantity" value={`${quantity(result.totalMixedQuantity)} ${result.quantityUnit}`} strong />
                <ResultLine label="Volume of one cavity" value={`${quantity(result.cavityVolumeMl)} ml`} />
                <ResultLine label="Total order quantity" value={quantity(numeric("orderQuantity"))} />
                <ResultLine label="Production capacity per round" value={quantity(result.productionCapacityPerRound)} />
                <ResultLine label="Number of production rounds" value={quantity(result.productionRounds)} strong />
              </div>
              <div>
                <h3 className="font-semibold text-[#1d4ed8]">Project costs</h3>
                <ResultLine label="Resin and hardener cost" value={money(result.resinAndHardenerCost)} />
                <ResultLine label="Resin consumed" value={money(result.resinCost)} />
                <ResultLine label="Hardener consumed" value={money(result.hardenerCost)} />
                <ResultLine label="Additional project expenses" value={money(result.expensesTotal)} />
                <ResultLine label="Total mould purchase cost" value={money(result.totalMouldCost)} />
                <ResultLine label="Mould cost allocation" value={money(result.mouldAllocationCost)} />
                <ResultLine label="Total project cost" value={money(result.totalOrderCost)} strong />
                <ResultLine label="Cost per piece" value={money(result.costPerPiece)} strong />
              </div>
            </div>
            <div className="rounded-xl border border-[#e2e7e8] p-4">
              <h3 className="font-semibold text-[#1d4ed8]">Sales and profit</h3>
              {result.totalSales === undefined ? <p className="mt-2 text-sm text-[#64717a]">Enter a selling price per piece to calculate sales and profit.</p> : <>
                <ResultLine label="Selling price per piece" value={money(numeric("sellingPricePerPiece"))} />
                <ResultLine label="Total sales" value={money(result.totalSales)} />
                <ResultLine label="Estimated total profit" value={money(result.totalProfit ?? 0)} strong />
                <ResultLine label="Estimated profit per piece" value={money(result.profitPerPiece ?? 0)} strong />
                {(result.totalProfit ?? 0) < 0 && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800">This project is estimated to make a loss at the entered selling price.</p>}
              </>}
            </div>
          </div> : <div className="rounded-xl border border-dashed border-[#cbd7d5] bg-[#faf8f5] p-5 text-sm leading-6 text-[#64717a]" role="status">
            <p className="font-semibold text-[#212529]">Your estimate will appear here.</p><p className="mt-1">{calculation.error}</p>
          </div>}
        </Section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#64717a]">Your entries stay in this page's memory only and are not saved.</p>
          <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cbd7d5] bg-white px-5 py-3 text-sm font-semibold text-[#212529] transition hover:bg-[#f4dcd6]"><RotateCcw size={16} aria-hidden="true" /> Reset Calculator</button>
        </div>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24">
        <div className="rounded-2xl bg-[#1d4ed8] p-5 text-white shadow-sm" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f4dcd6]">Live estimate</p>
          {result ? <div className="mt-3 space-y-3">
            <div><p className="text-xs text-white/80">Total project cost</p><p className="mt-1 text-2xl font-bold tabular-nums">{money(result.totalOrderCost)}</p></div>
            <div className="grid grid-cols-2 gap-3 border-t border-white/20 pt-3">
              <div><p className="text-xs text-white/80">Mixed quantity</p><p className="mt-1 text-lg font-semibold tabular-nums">{quantity(result.totalMixedQuantity)} {result.quantityUnit}</p></div>
              <div><p className="text-xs text-white/80">Cost per piece</p><p className="mt-1 text-lg font-semibold tabular-nums">{money(result.costPerPiece)}</p></div>
            </div>
          </div> : <p className="mt-3 text-sm leading-6 text-white/90">{calculation.error}</p>}
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e2e7e8]">
          <div className="flex items-center gap-2 text-[#8b1e5a]"><Calculator size={18} aria-hidden="true" /><h2 className="font-heading font-semibold text-[#1d4ed8]">Quick planning notes</h2></div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#52616a]">
            <li>One cavity's volume is multiplied by the total order quantity.</li>
            <li>Cavities per mould and moulds used determine production rounds only.</li>
            <li>Extra allowance is applied once to the total material requirement.</li>
            <li>Density is required only when a calculation converts between volume and weight.</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-[#212529] p-5 text-white">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-[#f4dcd6]" aria-hidden="true" /><h2 className="font-heading font-semibold">Manufacturer first</h2></div>
          <p className="mt-3 text-sm leading-6 text-white/80">Resin products differ in composition, mixing ratios, curing requirements and safety precautions. Always follow the specific instructions and Safety Data Sheet supplied by your resin manufacturer.</p>
        </div>
      </aside>

      <div className="space-y-6 lg:col-span-2">
        <Section number="09" title="Resin Colour Combination Guide" description="Choose two colours to see a common mixing result. This guide is independent of resin quantity and cost calculations.">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="First colour" name="colourA" value={colourA} onChange={(_, value) => setColourA(value)} options={["Red", "Yellow", "Blue", "White", "Black", "Purple", "Green"].map((colour): [string, string] => [colour, colour])} />
            <SelectField label="Second colour" name="colourB" value={colourB} onChange={(_, value) => setColourB(value)} options={["Red", "Yellow", "Blue", "White", "Black", "Purple", "Green"].map((colour): [string, string] => [colour, colour])} />
          </div>
          {selectedCombination ? <div className="mt-5 flex flex-wrap items-center justify-center gap-5 rounded-xl bg-[#faf8f5] p-5">
            {selectedCombination.colors.map((color, index) => <div key={color + index} className="text-center"><span className="mx-auto block h-14 w-14 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: color }} /><span className="mt-2 block text-xs font-semibold text-[#52616a]">{index === 0 ? selectedCombination.a : index === 1 ? selectedCombination.b : selectedCombination.result}</span></div>)}
            <div className="text-lg font-bold text-[#212529]">= {selectedCombination.result}</div>
          </div> : <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No basic combination is listed for {colourA} + {colourB}. Test a small sample before colouring your full batch.</p>}
          <p className="mt-4 text-xs leading-5 text-[#64717a]">Pigment type, concentration, transparency and colour strength affect the final appearance. Test a small sample before colouring your full batch.</p>
        </Section>

        <Section number="10" title="Resin Working Conditions & Safety Guide" description="These reminders are separate from the calculator and do not affect quantity, cost or profit results.">
          <div className="space-y-3">
            <details className="group rounded-xl border border-[#e2e7e8] p-4"><summary className="cursor-pointer list-none font-semibold text-[#212529]">Working in hot weather <span className="float-right text-[#8b1e5a] group-open:rotate-180">⌄</span></summary><p className="mt-3 text-sm leading-6 text-[#52616a]">High temperatures may shorten working time and change resin behaviour. Work within the manufacturer's temperature limits, avoid direct sunlight and mix manageable quantities.</p></details>
            <details className="group rounded-xl border border-[#e2e7e8] p-4"><summary className="cursor-pointer list-none font-semibold text-[#212529]">Working in cold weather <span className="float-right text-[#8b1e5a] group-open:rotate-180">⌄</span></summary><p className="mt-3 text-sm leading-6 text-[#52616a]">Low temperatures may make resin thicker and slow curing. Follow the manufacturer's recommended temperature range; do not use direct flames or uncontrolled heating.</p></details>
            <details className="group rounded-xl border border-[#e2e7e8] p-4"><summary className="cursor-pointer list-none font-semibold text-[#212529]">Humidity and moisture <span className="float-right text-[#8b1e5a] group-open:rotate-180">⌄</span></summary><p className="mt-3 text-sm leading-6 text-[#52616a]">Keep moulds, tools and work surfaces dry. Check the manufacturer's instructions for humidity and moisture limitations.</p></details>
            <details className="group rounded-xl border border-[#e2e7e8] p-4"><summary className="cursor-pointer list-none font-semibold text-[#212529]">Before pouring resin <span className="float-right text-[#8b1e5a] group-open:rotate-180">⌄</span></summary><ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#52616a]"><li>Confirm the correct manufacturer-specified ratio and measurement basis.</li><li>Measure and mix according to the product instructions.</li><li>Ensure the mould is clean, dry and level.</li><li>Check the recommended pour depth and working time.</li><li>Do not mix more than can be poured within the product's working time.</li></ul></details>
            <details className="group rounded-xl border border-[#e2e7e8] p-4"><summary className="cursor-pointer list-none font-semibold text-[#212529]">Resin safety <span className="float-right text-[#8b1e5a] group-open:rotate-180">⌄</span></summary><ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#52616a]"><li>Wear suitable protective gloves, eye protection and protective clothing.</li><li>Work in a properly ventilated area.</li><li>Read the product label and Safety Data Sheet.</li><li>Keep children and pets away from the working area.</li><li>Never pour uncured resin into drains.</li></ul></details>
          </div>
          <p className="mt-5 rounded-xl bg-[#f4dcd6] p-4 text-sm leading-6 text-[#68153f]">Resin products differ in composition, mixing ratios, curing requirements and safety precautions. Always follow the specific instructions and Safety Data Sheet supplied by your resin manufacturer.</p>
        </Section>
      </div>
    </div></div>
    <div className={activeCalculator === "lip-care" ? "block" : "hidden"}><div className="mx-auto max-w-6xl px-4 pt-8"><LipCareCalculator /></div></div>
  </div>;
}
