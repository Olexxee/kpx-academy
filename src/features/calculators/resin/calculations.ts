export type MouldShape = "round" | "square" | "rectangle" | "oval" | "irregular";
export type MeasurementUnit = "cm" | "mm" | "in";
export type RatioBasis = "volume" | "weight";
export type Ratio = "1:1" | "2:1" | "3:1";
export type MouldAllocation = "0" | "5" | "10" | "custom";

export interface ResinCalculatorInput {
  shape: MouldShape;
  unit: MeasurementUnit;
  diameter?: number;
  length?: number;
  width?: number;
  depth?: number;
  waterCapacityMl?: number;
  cavities: number;
  pieces: number;
  allowancePercent: number;
  ratioBasis: RatioBasis;
  ratio: Ratio;
  mixedSystemDensity?: number;
  resinPurchaseQuantity: number;
  resinPurchaseCost: number;
  hardenerPurchaseQuantity: number;
  hardenerPurchaseCost: number;
  expenses: {
    accessories: number;
    pigments: number;
    decorative: number;
    customisation: number;
    packaging: number;
    labourOther: number;
  };
  mouldPurchaseCost: number;
  mouldAllocation: MouldAllocation;
  customMouldAllocationPercent?: number;
  sellingPricePerPiece?: number;
}

export interface ResinCalculationResult {
  cavityVolumeMl: number;
  productionRounds: number;
  baseVolumeMl: number;
  allowanceVolumeMl: number;
  totalVolumeMl: number;
  totalMixedQuantity: number;
  resinQuantity: number;
  hardenerQuantity: number;
  resinCost: number;
  hardenerCost: number;
  expensesTotal: number;
  mouldAllocationCost: number;
  totalOrderCost: number;
  costPerPiece: number;
  totalSales?: number;
  profitPerPiece?: number;
  totalProfit?: number;
  isSellingPriceBelowCost: boolean;
}

export class CalculationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculationInputError";
  }
}

const finitePositive = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

const finiteNonNegative = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

function toCentimetres(value: number, unit: MeasurementUnit): number {
  if (!finitePositive(value)) throw new CalculationInputError("All mould measurements must be greater than zero.");
  if (unit === "mm") return value / 10;
  if (unit === "in") return value * 2.54;
  return value;
}

export function calculateCavityVolumeMl(input: Pick<ResinCalculatorInput,
  "shape" | "unit" | "diameter" | "length" | "width" | "depth" | "waterCapacityMl"
>): number {
  if (input.shape === "irregular") {
    if (!finitePositive(input.waterCapacityMl)) {
      throw new CalculationInputError("Enter the water capacity of one mould cavity in millilitres.");
    }
    return input.waterCapacityMl;
  }

  const depth = toCentimetres(input.depth ?? 0, input.unit);
  let cubicCentimetres: number;

  if (input.shape === "round") {
    const radius = toCentimetres((input.diameter ?? 0) / 2, input.unit);
    cubicCentimetres = Math.PI * radius * radius * depth;
  } else {
    const length = toCentimetres(input.length ?? 0, input.unit);
    const width = toCentimetres(input.width ?? 0, input.unit);
    cubicCentimetres = input.shape === "oval"
      ? Math.PI * (length / 2) * (width / 2) * depth
      : length * width * depth;
  }

  if (!Number.isFinite(cubicCentimetres) || cubicCentimetres <= 0) {
    throw new CalculationInputError("The mould measurements do not produce a valid volume.");
  }
  return cubicCentimetres;
}

function ratioParts(ratio: Ratio): [number, number] {
  const [resin, hardener] = ratio.split(":").map(Number);
  return [resin, hardener] as [number, number];
}

export function calculateResinProject(input: ResinCalculatorInput): ResinCalculationResult {
  if (!Number.isSafeInteger(input.cavities) || input.cavities < 1) {
    throw new CalculationInputError("Number of cavities must be a whole number greater than zero.");
  }
  if (!Number.isSafeInteger(input.pieces) || input.pieces < 1) {
    throw new CalculationInputError("Number of pieces must be a whole number greater than zero.");
  }
  if (!finiteNonNegative(input.allowancePercent)) {
    throw new CalculationInputError("Extra material allowance cannot be negative.");
  }
  if (!finitePositive(input.resinPurchaseQuantity) || !finitePositive(input.hardenerPurchaseQuantity)) {
    throw new CalculationInputError("Enter positive purchase quantities for both resin and hardener.");
  }
  if (!finiteNonNegative(input.resinPurchaseCost) || !finiteNonNegative(input.hardenerPurchaseCost)) {
    throw new CalculationInputError("Purchase costs cannot be negative.");
  }

  const expenseValues = Object.values(input.expenses);
  if (expenseValues.some((value) => !finiteNonNegative(value))) {
    throw new CalculationInputError("Project expenses must be zero or greater.");
  }
  if (!finiteNonNegative(input.mouldPurchaseCost)) {
    throw new CalculationInputError("Mould purchase cost cannot be negative.");
  }
  if (input.sellingPricePerPiece !== undefined && !finiteNonNegative(input.sellingPricePerPiece)) {
    throw new CalculationInputError("Selling price cannot be negative.");
  }

  const cavityVolumeMl = calculateCavityVolumeMl(input);
  // Each finished piece consumes one cavity's capacity. Cavities affect rounds, not order volume.
  const baseVolumeMl = cavityVolumeMl * input.pieces;
  const allowanceVolumeMl = baseVolumeMl * (input.allowancePercent / 100);
  const totalVolumeMl = baseVolumeMl + allowanceVolumeMl;
  if (![baseVolumeMl, allowanceVolumeMl, totalVolumeMl].every(Number.isFinite)) {
    throw new CalculationInputError("The requested order is too large to calculate safely. Check the dimensions and piece count.");
  }

  let totalMixedQuantity = totalVolumeMl;
  if (input.ratioBasis === "weight") {
    if (!finitePositive(input.mixedSystemDensity)) {
      throw new CalculationInputError(
        "A positive manufacturer-provided mixed-system density (g/ml) is required for weight-based estimates. Do not assume 1 ml = 1 g."
      );
    }
    totalMixedQuantity = totalVolumeMl * input.mixedSystemDensity;
  }

  const [resinParts, hardenerParts] = ratioParts(input.ratio);
  const totalParts = resinParts + hardenerParts;
  const resinQuantity = totalMixedQuantity * resinParts / totalParts;
  const hardenerQuantity = totalMixedQuantity * hardenerParts / totalParts;
  const resinCost = resinQuantity * (input.resinPurchaseCost / input.resinPurchaseQuantity);
  const hardenerCost = hardenerQuantity * (input.hardenerPurchaseCost / input.hardenerPurchaseQuantity);
  const expensesTotal = expenseValues.reduce((sum, value) => sum + value, 0);

  const allocationPercent = input.mouldAllocation === "custom"
    ? input.customMouldAllocationPercent
    : Number(input.mouldAllocation);
  if (!finiteNonNegative(allocationPercent)) {
    throw new CalculationInputError("Enter a valid mould cost allocation percentage.");
  }
  const mouldAllocationCost = input.mouldPurchaseCost * allocationPercent / 100;
  const totalOrderCost = resinCost + hardenerCost + expensesTotal + mouldAllocationCost;
  if (![totalMixedQuantity, resinQuantity, hardenerQuantity, resinCost, hardenerCost, mouldAllocationCost, totalOrderCost].every(Number.isFinite)) {
    throw new CalculationInputError("The entered quantities or prices are too large to calculate safely. Check your inputs.");
  }
  const costPerPiece = totalOrderCost / input.pieces;
  const hasSellingPrice = input.sellingPricePerPiece !== undefined;
  const totalSales = hasSellingPrice ? input.sellingPricePerPiece! * input.pieces : undefined;
  const profitPerPiece = hasSellingPrice ? input.sellingPricePerPiece! - costPerPiece : undefined;

  return {
    cavityVolumeMl,
    productionRounds: Math.ceil(input.pieces / input.cavities),
    baseVolumeMl,
    allowanceVolumeMl,
    totalVolumeMl,
    totalMixedQuantity,
    resinQuantity,
    hardenerQuantity,
    resinCost,
    hardenerCost,
    expensesTotal,
    mouldAllocationCost,
    totalOrderCost,
    costPerPiece,
    totalSales,
    profitPerPiece,
    totalProfit: hasSellingPrice ? totalSales! - totalOrderCost : undefined,
    isSellingPriceBelowCost: hasSellingPrice && input.sellingPricePerPiece! < costPerPiece,
  };
}
