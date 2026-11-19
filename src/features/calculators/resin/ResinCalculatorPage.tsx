import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calculator, Printer, RotateCcw, ShieldCheck } from "lucide-react";
import {
  calculateResinProject,
  type MouldShape,
  type Ratio,
  type RatioBasis,
  type ResinCalculatorInput,
} from "./calculations";

type FormValues = Record<string, string>;

const initialValues: FormValues = {
  projectName: "", shape: "round", unit: "cm", diameter: "", length: "", width: "", depth: "",
  waterCapacityMl: "", cavities: "1", pieces: "1", allowancePercent: "10", ratioBasis: "volume",
  ratio: "1:1", mixedSystemDensity: "", resinPurchaseQuantity: "", resinPurchaseCost: "",
  hardenerPurchaseQuantity: "", hardenerPurchaseCost: "", accessories: "", pigments: "",
  decorative: "", customisation: "", packaging: "", labourOther: "", mouldPurchaseCost: "",
  mouldAllocation: "0", customMouldAllocationPercent: "", sellingPricePerPiece: "",
};

const expenseFields = [
  ["accessories", "Accessories", "Key rings, chains, hooks and fittings"],
  ["pigments", "Pigments and colours", "Pigments, dyes and colourants"],
  ["decorative", "Decorative add-ons", "Glitter, flakes, beads and inserts"],
  ["customisation", "Customisation", "Names, letters, photographs and personalisation"],
  ["packaging", "Packaging and finishing", "Boxes, pouches, labels, sanding and polishing"],
  ["labourOther", "Labour and other expenses", "Labour, electricity, transport and other costs"],
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

const money = (value: number) => new Intl.NumberFormat("en-NG", {
  style: "currency", currency: "NGN", maximumFractionDigits: 2,
}).format(value);
const quantity = (value: number) => new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 2,
}).format(value);

function Field({ label, name, value, onChange, type = "number", hint, min = "0", step = "any", required = false }: {
  label: string; name: string; value: string; onChange: (name: string, value: string) => void;
  type?: string; hint?: string; min?: string; step?: string; required?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[#17324D]">{label}{required && <span aria-hidden="true"> *</span>}</span>
      <input
        name={name}
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        required={required}
        className="min-h-12 w-full rounded-xl border border-[#d8dfe3] bg-white px-3 py-2.5 text-sm text-[#212529] outline-none transition focus:border-[#2A7F7F] focus:ring-2 focus:ring-[#2A7F7F]/15"
      />
      {hint && <span className="mt-1.5 block text-xs leading-5 text-[#64717a]">{hint}</span>}
    </label>
  );
}

function SelectField({ label, name, value, onChange, options, hint }: {
  label: string; name: string; value: string; onChange: (name: string, value: string) => void;
  options: Array<[string, string]>; hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[#17324D]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="min-h-12 w-full rounded-xl border border-[#d8dfe3] bg-white px-3 py-2.5 text-sm text-[#212529] outline-none focus:border-[#2A7F7F] focus:ring-2 focus:ring-[#2A7F7F]/15"
      >
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
      {hint && <span className="mt-1.5 block text-xs leading-5 text-[#64717a]">{hint}</span>}
    </label>
  );
}

function Section({ number, title, description, children }: {
  number: string; title: string; description?: string; children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e2e7e8] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f1ef] text-sm font-bold text-[#2A7F7F]">{number}</span>
        <div>
          <h2 className="font-heading text-xl font-semibold text-[#17324D]">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-[#64717a]">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function ResultLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 ${strong ? "border-t border-[#dce5e4] font-bold text-[#17324D]" : "border-b border-[#edf0f0] text-[#52616a]"}`}>
      <span className="text-sm">{label}</span>
      <span className="text-right text-sm tabular-nums">{value}</span>
    </div>
  );
}

export default function ResinCalculatorPage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [colourA, setColourA] = useState("Red");
  const [colourB, setColourB] = useState("Yellow");

  const update = (name: string, value: string) => setValues((current) => ({ ...current, [name]: value }));
  const numeric = (name: string) => values[name]?.trim() === "" ? undefined : Number(values[name]);
  const basis = values.ratioBasis as RatioBasis;
  const unitLabel = basis === "weight" ? "g" : "ml";

  const calculation = useMemo(() => {
    const shape = values.shape as MouldShape;
    const input: ResinCalculatorInput = {
      shape,
      unit: values.unit as ResinCalculatorInput["unit"],
      diameter: numeric("diameter"),
      length: numeric("length"),
      width: numeric("width"),
      depth: numeric("depth"),
      waterCapacityMl: numeric("waterCapacityMl"),
      cavities: numeric("cavities") ?? 0,
      pieces: numeric("pieces") ?? 0,
      allowancePercent: numeric("allowancePercent") ?? -1,
      ratioBasis: basis,
      ratio: values.ratio as Ratio,
      mixedSystemDensity: numeric("mixedSystemDensity"),
      resinPurchaseQuantity: numeric("resinPurchaseQuantity") ?? 0,
      resinPurchaseCost: numeric("resinPurchaseCost") ?? 0,
      hardenerPurchaseQuantity: numeric("hardenerPurchaseQuantity") ?? 0,
      hardenerPurchaseCost: numeric("hardenerPurchaseCost") ?? 0,
      expenses: {
        accessories: numeric("accessories") ?? 0,
        pigments: numeric("pigments") ?? 0,
        decorative: numeric("decorative") ?? 0,
        customisation: numeric("customisation") ?? 0,
        packaging: numeric("packaging") ?? 0,
        labourOther: numeric("labourOther") ?? 0,
      },
      mouldPurchaseCost: numeric("mouldPurchaseCost") ?? 0,
      mouldAllocation: values.mouldAllocation as ResinCalculatorInput["mouldAllocation"],
      customMouldAllocationPercent: numeric("customMouldAllocationPercent"),
      sellingPricePerPiece: numeric("sellingPricePerPiece"),
    };
    try {
      if (!values.resinPurchaseQuantity.trim() || !values.resinPurchaseCost.trim() || !values.hardenerPurchaseQuantity.trim() || !values.hardenerPurchaseCost.trim()) {
        throw new Error("Enter the purchased quantity and amount paid for both resin and hardener to calculate project cost.");
      }
      return { result: calculateResinProject(input), error: "" };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : "Complete the required fields to calculate your estimate." };
    }
    // The form state is intentionally the single source of truth for this browser-only calculation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const selectedCombination = combinations.find((item) =>
    (item.a === colourA && item.b === colourB) || (item.a === colourB && item.b === colourA),
  );

  const reset = () => setValues(initialValues);
  const isIrregular = values.shape === "irregular";
  const isRound = values.shape === "round";
  const result = calculation.result;

  return (
    <div className="bg-[#F7F5F0] pb-20">
      <div className="bg-[#17324D] px-4 py-12 text-white sm:py-16">
        <div className="mx-auto max-w-6xl">
          <Link to="/resources" className="inline-flex items-center gap-2 text-sm font-medium text-white/75 transition hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" /> Back to learning resources
          </Link>
          <div className="mt-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4A85A]">KPX Academy · Practical project planning</p>
            <h1 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">Resin Planning & Cost Calculator</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
              Estimate mould capacity, resin and hardener quantities, production costs and a workable selling price before you begin.
            </p>
            <p className="mt-3 text-sm text-white/65">All calculations run in this browser. Your entries are not saved or sent to KPX Academy.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-7 px-4 pt-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-6">
          <Section number="01" title="Project Information" description="Name your project and tell us how many finished pieces you need.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Project name or description (optional)" name="projectName" value={values.projectName} onChange={update} type="text" />
              <SelectField label="Mould shape" name="shape" value={values.shape} onChange={update} options={[
                ["round", "Round / Circular"], ["square", "Square"], ["rectangle", "Rectangular"], ["oval", "Oval"], ["irregular", "Irregular / Other"],
              ]} />
              <Field label="Number of pieces in the order" name="pieces" value={values.pieces} onChange={update} min="1" step="1" required />
            </div>
          </Section>

          <Section number="02" title="Mould Measurement" description="Measure one cavity. The calculator uses that capacity for each finished piece.">
            <div className="mb-5 rounded-xl bg-[#f1f6f5] p-4">
              <p className="text-sm font-semibold text-[#17324D]">How to measure your mould</p>
              <svg viewBox="0 0 520 170" role="img" aria-label="Mould measurement diagram showing length, width, diameter and depth" className="mb-4 h-auto w-full rounded-lg bg-white p-3">
                <path d="M85 55 L250 55 L315 90 L150 90 Z" fill="#e7f1ef" stroke="#2A7F7F" strokeWidth="2" />
                <path d="M85 55 L85 112 L150 147 L150 90" fill="#d6e8e4" stroke="#2A7F7F" strokeWidth="2" />
                <path d="M150 90 L315 90 L315 147 L150 147 Z" fill="#f7faf9" stroke="#2A7F7F" strokeWidth="2" />
                <path d="M85 38 L250 38 M85 33 L85 43 M250 33 L250 43" stroke="#D94A91" strokeWidth="2" />
                <text x="167" y="28" textAnchor="middle" fontSize="12" fill="#17324D">Length</text>
                <path d="M65 55 L65 112 M60 55 L70 55 M60 112 L70 112" stroke="#D94A91" strokeWidth="2" />
                <text x="55" y="88" textAnchor="end" fontSize="12" fill="#17324D">Depth</text>
                <path d="M260 48 L325 83 M257 43 L263 53 M320 78 L330 88" stroke="#D94A91" strokeWidth="2" />
                <text x="342" y="79" fontSize="12" fill="#17324D">Width</text>
                <ellipse cx="420" cy="90" rx="43" ry="36" fill="#f7faf9" stroke="#2A7F7F" strokeWidth="2" />
                <path d="M377 90 L463 90 M377 85 L377 95 M463 85 L463 95" stroke="#D94A91" strokeWidth="2" />
                <text x="420" y="143" textAnchor="middle" fontSize="12" fill="#17324D">Diameter</text>
              </svg>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white p-3 text-sm leading-6 text-[#52616a]"><strong className="text-[#17324D]">Length:</strong> longest measurement from one end to the other.</div>
                <div className="rounded-lg bg-white p-3 text-sm leading-6 text-[#52616a]"><strong className="text-[#17324D]">Width:</strong> measurement across the mould from side to side.</div>
                <div className="rounded-lg bg-white p-3 text-sm leading-6 text-[#52616a]"><strong className="text-[#17324D]">Diameter:</strong> straight measurement across the centre of a circular mould.</div>
                <div className="rounded-lg bg-white p-3 text-sm leading-6 text-[#52616a]"><strong className="text-[#17324D]">Depth:</strong> inside bottom surface to the top edge.</div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Measurement unit" name="unit" value={values.unit} onChange={update} options={[["cm", "Centimetres (cm)"], ["mm", "Millimetres (mm)"], ["in", "Inches (in)"]]} />
              {isIrregular ? (
                <>
                  <Field label="Water capacity of one cavity (ml)" name="waterCapacityMl" value={values.waterCapacityMl} onChange={update} hint="Measure one cavity using water, not the full mould." required />
                  <Field label={`Depth reference (${values.unit}, optional)`} name="depth" value={values.depth} onChange={update} hint="Recorded for reference only; water capacity drives the volume estimate." />
                </>
              ) : (
                <>
                  {isRound ? <Field label={`Diameter (${values.unit})`} name="diameter" value={values.diameter} onChange={update} required /> : <Field label={`Length (${values.unit})`} name="length" value={values.length} onChange={update} required />}
                  {!isRound && <Field label={`Width (${values.unit})`} name="width" value={values.width} onChange={update} required />}
                  <Field label={`Depth (${values.unit})`} name="depth" value={values.depth} onChange={update} required />
                </>
              )}
              <Field label="Number of identical cavities / moulds" name="cavities" value={values.cavities} onChange={update} min="1" step="1" hint="Used to estimate production rounds, not to multiply the total order volume." required />
            </div>
            {isIrregular && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">After measuring with water, empty the mould and allow it to dry completely before using resin. Any remaining moisture may affect the resin result.</p>}
            <p className="mt-4 text-xs leading-5 text-[#64717a]">For geometric estimates, 1 cubic centimetre is treated as 1 millilitre of cavity volume. Actual mould capacity can differ because of curves, texture and fill level.</p>
          </Section>

          <Section number="03" title="Resin Measurement & Mixing Ratio" description="Use the measurement basis and ratio printed in your resin manufacturer's instructions.">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Manufacturer's ratio basis" name="ratioBasis" value={values.ratioBasis} onChange={update} options={[["volume", "By Volume (ml)"], ["weight", "By Weight (g)"]]} />
              <SelectField label="Resin : Hardener ratio" name="ratio" value={values.ratio} onChange={update} options={[["1:1", "1 part resin : 1 part hardener"], ["2:1", "2 parts resin : 1 part hardener"], ["3:1", "3 parts resin : 1 part hardener"]]} />
              <Field label="Extra material allowance (%)" name="allowancePercent" value={values.allowancePercent} onChange={update} hint="Default 10%. Set to 0 if you do not want an allowance." />
              {basis === "weight" && <Field label="Mixed-system density (g/ml)" name="mixedSystemDensity" value={values.mixedSystemDensity} onChange={update} hint="Enter the manufacturer's density for the mixed resin + hardener system. This is required for a weight estimate." required />}
            </div>
            <div className="mt-5 rounded-xl border border-[#dce5e4] bg-[#f7faf9] p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-[#17324D]">Resin</span>
                <span className="text-sm font-bold text-[#2A7F7F]">{values.ratio.split(":")[0]} part(s)</span>
              </div>
              <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-[#dfe7e5]">
                <div className="bg-[#2A7F7F]" style={{ width: `${Number(values.ratio.split(":")[0]) / (Number(values.ratio.split(":")[0]) + Number(values.ratio.split(":")[1])) * 100}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-[#17324D]">Hardener</span>
                <span className="text-sm font-bold text-[#D94A91]">{values.ratio.split(":")[1]} part(s)</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#64717a]">The first number is resin; the second is hardener. The ratio is not a universal default—select the exact ratio for your product.</p>
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">A volume ratio and a weight ratio are not necessarily interchangeable. When using weight, the calculator requires manufacturer-provided mixed-system density. It will not assume 1 ml = 1 g.</p>
          </Section>

          <Section number="04" title="Resin & Hardener Purchase Information" description={`Enter the quantity and purchase price for each component. Quantities must use the selected ratio basis (${unitLabel}).`}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-[#e4e9e8] p-4">
                <h3 className="font-semibold text-[#17324D]">Resin</h3>
                <Field label={`Quantity purchased (${unitLabel})`} name="resinPurchaseQuantity" value={values.resinPurchaseQuantity} onChange={update} required />
                <Field label="Amount paid (₦)" name="resinPurchaseCost" value={values.resinPurchaseCost} onChange={update} required />
              </div>
              <div className="space-y-4 rounded-xl border border-[#e4e9e8] p-4">
                <h3 className="font-semibold text-[#17324D]">Hardener</h3>
                <Field label={`Quantity purchased (${unitLabel})`} name="hardenerPurchaseQuantity" value={values.hardenerPurchaseQuantity} onChange={update} required />
                <Field label="Amount paid (₦)" name="hardenerPurchaseCost" value={values.hardenerPurchaseCost} onChange={update} required />
              </div>
            </div>
          </Section>

          <Section number="05" title="Additional Project Expenses" description="These optional costs are added to the project total. Leave any unused item at zero.">
            <div className="grid gap-4 sm:grid-cols-2">
              {expenseFields.map(([name, label, hint]) => <Field key={name} label={`${label} (₦)`} name={name} value={values[name]} onChange={update} hint={hint} />)}
            </div>
          </Section>

          <Section number="06" title="Mould Cost Allocation" description="Allocate part of the reusable mould's purchase price to this project.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mould purchase price (₦)" name="mouldPurchaseCost" value={values.mouldPurchaseCost} onChange={update} />
              <SelectField label="Allocation" name="mouldAllocation" value={values.mouldAllocation} onChange={update} options={[["0", "No allocation (0%)"], ["5", "5%"], ["10", "10%"], ["custom", "Custom percentage"]]} />
              {values.mouldAllocation === "custom" && <Field label="Custom allocation (%)" name="customMouldAllocationPercent" value={values.customMouldAllocationPercent} onChange={update} />}
            </div>
            <p className="mt-4 text-xs leading-5 text-[#64717a]">Moulds are reusable equipment. Allocating a portion of their purchase cost helps you recover that cost gradually and plan for future replacement.</p>
          </Section>

          <Section number="07" title="Selling Price (Optional)" description="Add your proposed selling price per finished piece to estimate sales and profit.">
            <div className="max-w-sm">
              <Field label="Proposed selling price per piece (₦)" name="sellingPricePerPiece" value={values.sellingPricePerPiece} onChange={update} hint="Leave blank if you only want material and production costs." />
            </div>
          </Section>

          <Section number="08" title="Calculation Results" description="Results update as you change your project details and costs.">
            {result ? (
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-[#eaf3f1] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#55716c]">Total mixed material</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#17324D]">{quantity(result.totalMixedQuantity)} {unitLabel}</p></div>
                  <div className="rounded-xl bg-[#edf1f7] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#62728b]">Estimated order cost</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#17324D]">{money(result.totalOrderCost)}</p></div>
                  <div className="rounded-xl bg-[#f8edf2] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#8c5570]">Cost per piece</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#17324D]">{money(result.costPerPiece)}</p></div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="font-semibold text-[#17324D]">Material estimate</h3>
                    <ResultLine label="Capacity per cavity" value={`${quantity(result.cavityVolumeMl)} ml`} />
                    <ResultLine label="Pieces in order" value={quantity(Number(values.pieces))} />
                    <ResultLine label="Production rounds" value={quantity(result.productionRounds)} />
                    <ResultLine label="Base material volume" value={`${quantity(result.baseVolumeMl)} ml`} />
                    <ResultLine label={`Allowance (${values.allowancePercent}%)`} value={`${quantity(result.allowanceVolumeMl)} ml`} />
                    <ResultLine label="Resin required" value={`${quantity(result.resinQuantity)} ${unitLabel}`} />
                    <ResultLine label="Hardener required" value={`${quantity(result.hardenerQuantity)} ${unitLabel}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#17324D]">Cost breakdown</h3>
                    <ResultLine label="Resin used" value={money(result.resinCost)} />
                    <ResultLine label="Hardener used" value={money(result.hardenerCost)} />
                    <ResultLine label="Resin + hardener total" value={money(result.resinCost + result.hardenerCost)} strong />
                    {expenseFields.map(([name, label]) => <ResultLine key={name} label={label} value={money(Number(values[name]) || 0)} />)}
                    <ResultLine label="Mould allocation" value={money(result.mouldAllocationCost)} />
                    <ResultLine label="Total estimated order cost" value={money(result.totalOrderCost)} strong />
                  </div>
                </div>
                {result.totalSales !== undefined && (
                  <div className={`rounded-xl border p-4 ${result.isSellingPriceBelowCost ? "border-red-200 bg-red-50" : "border-[#dce5e4] bg-[#f7faf9]"}`}>
                    <h3 className="font-semibold text-[#17324D]">Sales & profit estimate</h3>
                    <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
                      <ResultLine label="Selling price per piece" value={money(Number(values.sellingPricePerPiece))} />
                      <ResultLine label="Total estimated sales" value={money(result.totalSales)} />
                      <ResultLine label="Profit per piece" value={money(result.profitPerPiece ?? 0)} />
                      <ResultLine label="Total estimated profit" value={money(result.totalProfit ?? 0)} />
                    </div>
                    {result.isSellingPriceBelowCost && <p className="mt-3 text-sm font-semibold text-red-800">Your proposed selling price is below the estimated cost per piece. You would make a loss at this price.</p>}
                  </div>
                )}
                <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#17324D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2A7F7F]">
                  <Printer size={16} aria-hidden="true" /> Print calculation summary
                </button>
                <p className="text-xs leading-5 text-[#64717a]">These figures are estimates based on the information entered. Actual material usage and costs may vary depending on the resin brand, mould design, working conditions, material prices and production method. Review your estimates before accepting an order or quoting a customer.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#cbd7d5] bg-[#f7faf9] p-5 text-sm leading-6 text-[#64717a]" role="status">
                <p className="font-semibold text-[#17324D]">Your estimate will appear here.</p>
                <p className="mt-1">{calculation.error}</p>
              </div>
            )}
          </Section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#64717a]">Your entries stay in this browser tab and are not saved.</p>
            <button type="button" onClick={reset} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cbd7d5] bg-white px-5 py-3 text-sm font-semibold text-[#17324D] transition hover:bg-[#edf4f2]">
              <RotateCcw size={16} aria-hidden="true" /> Reset calculator
            </button>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e2e7e8]">
            <div className="flex items-center gap-2 text-[#2A7F7F]"><Calculator size={18} aria-hidden="true" /><h2 className="font-heading font-semibold text-[#17324D]">Quick planning notes</h2></div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#52616a]">
              <li>Measure one cavity accurately and use the same dimensions for each identical piece.</li>
              <li>Production rounds are rounded up when the order is not an exact multiple of your cavity count.</li>
              <li>Allowance is added after the total volume for all pieces is calculated.</li>
              <li>Purchase quantities and prices must use the same basis selected for your resin ratio.</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-[#17324D] p-5 text-white">
            <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-[#D4A85A]" aria-hidden="true" /><h2 className="font-heading font-semibold">Manufacturer first</h2></div>
            <p className="mt-3 text-sm leading-6 text-white/75">Resin products differ in composition, mixing ratios, curing requirements and safety precautions. Always follow the specific instructions and Safety Data Sheet supplied by your resin manufacturer.</p>
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-2">
          <Section number="09" title="Resin Colour Combination Guide" description="Choose two colours to see a common beginner colour-mixing result. This guide works independently of the cost estimate.">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="First colour" name="colourA" value={colourA} onChange={(_, value) => setColourA(value)} options={["Red", "Yellow", "Blue", "White", "Black", "Purple", "Green"].map((colour): [string, string] => [colour, colour])} />
              <SelectField label="Second colour" name="colourB" value={colourB} onChange={(_, value) => setColourB(value)} options={["Red", "Yellow", "Blue", "White", "Black", "Purple", "Green"].map((colour) => [colour, colour])} />
            </div>
            {selectedCombination ? (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-5 rounded-xl bg-[#f7faf9] p-5">
                {selectedCombination.colors.map((color, index) => <div key={color + index} className="text-center"><span className="mx-auto block h-14 w-14 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: color }} /><span className="mt-2 block text-xs font-semibold text-[#52616a]">{index === 0 ? selectedCombination.a : index === 1 ? selectedCombination.b : selectedCombination.result}</span></div>)}
                <div className="text-lg font-bold text-[#17324D]">= {selectedCombination.result}</div>
              </div>
            ) : <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">No basic combination is listed for {colourA} + {colourB}. Test a small sample before colouring your full batch.</p>}
            <p className="mt-4 text-xs leading-5 text-[#64717a]">These combinations are basic colour guides. The final appearance may vary depending on pigment type, concentration, transparency and colour strength. Add pigments gradually and test a small sample before colouring your full batch.</p>
          </Section>

          <Section number="10" title="Resin Working Conditions & Safety Guide" description="Open each topic for practical reminders before you start mixing and pouring.">
            <div className="space-y-3">
              <details className="group rounded-xl border border-[#e2e7e8] p-4">
                <summary className="cursor-pointer list-none font-semibold text-[#17324D] marker:hidden">Working in hot weather <span className="float-right text-[#2A7F7F] group-open:rotate-180">⌄</span></summary>
                <p className="mt-3 text-sm leading-6 text-[#52616a]">High temperatures may make resin thinner, shorten its working time and cause heat to build up more quickly.</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#52616a]"><li>Work in a shaded and well-ventilated area.</li><li>Avoid direct sunlight.</li><li>Mix manageable quantities.</li><li>Monitor the resin's working time.</li><li>Follow the temperature limits specified by the manufacturer.</li></ul>
              </details>
              <details className="group rounded-xl border border-[#e2e7e8] p-4">
                <summary className="cursor-pointer list-none font-semibold text-[#17324D]">Working in cold weather <span className="float-right text-[#2A7F7F] group-open:rotate-180">⌄</span></summary>
                <p className="mt-3 text-sm leading-6 text-[#52616a]">Low temperatures may make resin thicker, more difficult to mix and slower to cure.</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#52616a]"><li>Maintain the temperature range recommended by the manufacturer.</li><li>Allow materials to reach the recommended working temperature where appropriate.</li><li>Do not use direct flames or uncontrolled heating methods.</li></ul>
              </details>
              <details className="group rounded-xl border border-[#e2e7e8] p-4">
                <summary className="cursor-pointer list-none font-semibold text-[#17324D]">Humidity and moisture <span className="float-right text-[#2A7F7F] group-open:rotate-180">⌄</span></summary>
                <p className="mt-3 text-sm leading-6 text-[#52616a]">Moisture and humidity may cause surface defects, cloudiness or curing problems in some resin systems.</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#52616a]"><li>Ensure moulds are completely dry.</li><li>Keep tools and working surfaces dry.</li><li>Check the manufacturer's instructions for humidity limitations.</li></ul>
              </details>
              <details className="group rounded-xl border border-[#e2e7e8] p-4">
                <summary className="cursor-pointer list-none font-semibold text-[#17324D]">Before pouring resin <span className="float-right text-[#2A7F7F] group-open:rotate-180">⌄</span></summary>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#52616a]"><li>Confirm the correct resin-to-hardener ratio.</li><li>Measure the components accurately.</li><li>Follow the manufacturer's mixing time.</li><li>Scrape the sides and bottom of the mixing container while mixing.</li><li>Ensure the mould is clean, dry and level.</li><li>Check the recommended maximum pour depth.</li><li>Check the product's working time or pot life.</li><li>Do not mix more resin than can be poured within the recommended working time.</li></ul>
              </details>
              <details className="group rounded-xl border border-[#e2e7e8] p-4">
                <summary className="cursor-pointer list-none font-semibold text-[#17324D]">Resin safety <span className="float-right text-[#2A7F7F] group-open:rotate-180">⌄</span></summary>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-[#52616a]"><li>Wear suitable protective gloves.</li><li>Use appropriate eye protection.</li><li>Wear protective clothing.</li><li>Work in a properly ventilated area.</li><li>Read the product label and Safety Data Sheet.</li><li>Keep children and pets away from the working area.</li><li>Never pour uncured resin into drains.</li></ul>
              </details>
            </div>
            <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Resin products differ in composition, mixing ratios, curing requirements and safety precautions. Always follow the specific instructions and Safety Data Sheet supplied by your resin manufacturer.</p>
          </Section>
        </div>
      </div>
    </div>
  );
}
