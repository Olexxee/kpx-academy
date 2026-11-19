export type MouldShape = "round" | "square" | "rectangle" | "oval" | "irregular";
export type MeasurementUnit = "cm" | "mm" | "in";
export type RatioBasis = "volume" | "weight";
export type PurchaseUnit = "g" | "ml";
export type PurchaseMethod = "separate" | "combined";

export interface ResinCalculatorInput {
  shape: MouldShape;
  unit: MeasurementUnit;
  diameter?: number;
  length?: number;
  width?: number;
  depth?: number;
  waterCapacityMl?: number;
  cavitiesPerMould: number;
  mouldsUsed: number;
  orderQuantity: number;
  allowancePercent: number;
  ratioBasis: RatioBasis;
  resinRatioParts: number;
  hardenerRatioParts: number;
  mixedSystemDensity?: number;
  resinDensity?: number;
  hardenerDensity?: number;
  purchaseMethod: PurchaseMethod;
  resinPurchaseQuantity: number;
  resinPurchaseUnit: PurchaseUnit;
  resinPurchasePrice: number;
  hardenerPurchaseQuantity: number;
  hardenerPurchaseUnit: PurchaseUnit;
  hardenerPurchasePrice: number;
  combinedPurchasePrice: number;
  expenses: {
    accessories: number;
    pigments: number;
    decorative: number;
    customisation: number;
    packaging: number;
    labourOther: number;
  };
  costPerMould: number;
  mouldAllocationPercent: number;
  sellingPricePerPiece?: number;
}

export interface ResinCalculationResult {
  cavityVolumeMl: number;
  productionCapacityPerRound: number;
  productionRounds: number;
  baseVolumeMl: number;
  allowanceVolumeMl: number;
  totalVolumeMl: number;
  totalMixedQuantity: number;
  quantityUnit: "g" | "ml";
  resinQuantity: number;
  hardenerQuantity: number;
  resinCost: number;
  hardenerCost: number;
  resinAndHardenerCost: number;
  expensesTotal: number;
  totalMouldCost: number;
  mouldAllocationCost: number;
  totalOrderCost: number;
  costPerPiece: number;
  totalSales?: number;
  totalProfit?: number;
  profitPerPiece?: number;
}

export class CalculationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CalculationInputError";
  }
}

const positive = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;
const nonNegative = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

function toCentimetres(value: number, unit: MeasurementUnit): number {
  if (!positive(value)) throw new CalculationInputError("All mould measurements must be greater than zero.");
  if (unit === "mm") return value / 10;
  if (unit === "in") return value * 2.54;
  return value;
}

export function calculateCavityVolumeMl(input: Pick<ResinCalculatorInput,
  "shape" | "unit" | "diameter" | "length" | "width" | "depth" | "waterCapacityMl"
>): number {
  if (input.shape === "irregular") {
    if (!positive(input.waterCapacityMl)) {
      throw new CalculationInputError("Enter the water capacity of one cavity in millilitres.");
    }
    return input.waterCapacityMl;
  }
  const depth = toCentimetres(input.depth ?? 0, input.unit);
  let volumeCm3: number;
  if (input.shape === "round") {
    const radius = toCentimetres((input.diameter ?? 0) / 2, input.unit);
    volumeCm3 = Math.PI * radius * radius * depth;
  } else {
    const length = toCentimetres(input.length ?? 0, input.unit);
    const width = toCentimetres(input.width ?? 0, input.unit);
    volumeCm3 = input.shape === "oval"
      ? Math.PI * (length / 2) * (width / 2) * depth
      : length * width * depth;
  }
  if (!positive(volumeCm3)) throw new CalculationInputError("The mould measurements do not produce a valid volume.");
  return volumeCm3;
}

function convertQuantity(value: number, from: PurchaseUnit, to: PurchaseUnit, density: number | undefined, component: string): number {
  if (from === to) return value;
  if (!positive(density)) {
    throw new CalculationInputError(`Enter the verified ${component} density (g/ml) to convert between grams and millilitres.`);
  }
  return from === "ml" && to === "g" ? value * density : value / density;
}

function consumedCost(
  consumedInBasis: number,
  basis: RatioBasis,
  purchaseQuantity: number,
  purchaseUnit: PurchaseUnit,
  purchasePrice: number,
  density: number | undefined,
  component: string,
): number {
  const basisUnit: PurchaseUnit = basis === "weight" ? "g" : "ml";
  const consumedInPurchaseUnit = convertQuantity(consumedInBasis, basisUnit, purchaseUnit, density, component);
  return consumedInPurchaseUnit * purchasePrice / purchaseQuantity;
}

export function calculateResinProject(input: ResinCalculatorInput): ResinCalculationResult {
  if (!Number.isSafeInteger(input.cavitiesPerMould) || input.cavitiesPerMould < 1) {
    throw new CalculationInputError("Number of cavities per mould must be a whole number greater than zero.");
  }
  if (!Number.isSafeInteger(input.mouldsUsed) || input.mouldsUsed < 1) {
    throw new CalculationInputError("Number of moulds used must be a whole number greater than zero.");
  }
  if (!Number.isSafeInteger(input.orderQuantity) || input.orderQuantity < 1) {
    throw new CalculationInputError("Order quantity must be a whole number greater than zero.");
  }
  if (!nonNegative(input.allowancePercent)) throw new CalculationInputError("Extra material allowance cannot be negative.");
  if (!positive(input.resinRatioParts) || !positive(input.hardenerRatioParts)) {
    throw new CalculationInputError("Enter positive resin and hardener ratio parts.");
  }
  if (!nonNegative(input.costPerMould) || !nonNegative(input.mouldAllocationPercent) || input.mouldAllocationPercent > 100) {
    throw new CalculationInputError("Enter a valid mould cost and allocation percentage between 0 and 100.");
  }
  const expenses = Object.values(input.expenses);
  if (expenses.some((amount) => !nonNegative(amount))) throw new CalculationInputError("Project expenses must be zero or greater.");
  if (input.sellingPricePerPiece !== undefined && !nonNegative(input.sellingPricePerPiece)) {
    throw new CalculationInputError("Selling price cannot be negative.");
  }

  const cavityVolumeMl = calculateCavityVolumeMl(input);
  const productionCapacityPerRound = input.cavitiesPerMould * input.mouldsUsed;
  if (!Number.isSafeInteger(productionCapacityPerRound)) {
    throw new CalculationInputError("The production capacity per round is too large to calculate safely.");
  }
  const productionRounds = Math.ceil(input.orderQuantity / productionCapacityPerRound);

  // Order volume is based on pieces ordered, never on mould capacity or production rounds.
  const baseVolumeMl = cavityVolumeMl * input.orderQuantity;
  const allowanceVolumeMl = baseVolumeMl * input.allowancePercent / 100;
  const totalVolumeMl = baseVolumeMl + allowanceVolumeMl;
  if (![baseVolumeMl, allowanceVolumeMl, totalVolumeMl].every(Number.isFinite)) {
    throw new CalculationInputError("The requested order is too large to calculate safely.");
  }

  if (input.ratioBasis === "weight" && !positive(input.mixedSystemDensity)) {
    throw new CalculationInputError("Enter the verified mixed-system density (g/ml) supplied for your resin product. There is no universal resin density.");
  }

  const totalMixedQuantity = input.ratioBasis === "weight"
    ? totalVolumeMl * input.mixedSystemDensity!
    : totalVolumeMl;
  const ratioTotal = input.resinRatioParts + input.hardenerRatioParts;
  const resinQuantity = totalMixedQuantity * input.resinRatioParts / ratioTotal;
  const hardenerQuantity = totalMixedQuantity * input.hardenerRatioParts / ratioTotal;

  let resinCost: number;
  let hardenerCost: number;
  if (input.purchaseMethod === "separate") {
    if (!positive(input.resinPurchaseQuantity) || !positive(input.hardenerPurchaseQuantity)) {
      throw new CalculationInputError("Enter positive purchased quantities for resin and hardener.");
    }
    if (!nonNegative(input.resinPurchasePrice) || !nonNegative(input.hardenerPurchasePrice)) {
      throw new CalculationInputError("Resin and hardener purchase prices cannot be negative.");
    }
    resinCost = consumedCost(resinQuantity, input.ratioBasis, input.resinPurchaseQuantity, input.resinPurchaseUnit, input.resinPurchasePrice, input.resinDensity, "resin");
    hardenerCost = consumedCost(hardenerQuantity, input.ratioBasis, input.hardenerPurchaseQuantity, input.hardenerPurchaseUnit, input.hardenerPurchasePrice, input.hardenerDensity, "hardener");
  } else {
    if (!positive(input.resinPurchaseQuantity) || !positive(input.hardenerPurchaseQuantity) || !nonNegative(input.combinedPurchasePrice)) {
      throw new CalculationInputError("Enter positive resin and hardener quantities in the kit and a non-negative combined kit price.");
    }
    const basisUnit: PurchaseUnit = input.ratioBasis === "weight" ? "g" : "ml";
    const kitResinBasis = convertQuantity(input.resinPurchaseQuantity, input.resinPurchaseUnit, basisUnit, input.resinDensity, "resin");
    const kitHardenerBasis = convertQuantity(input.hardenerPurchaseQuantity, input.hardenerPurchaseUnit, basisUnit, input.hardenerDensity, "hardener");
    const kitTotalBasis = kitResinBasis + kitHardenerBasis;
    if (!positive(kitTotalBasis)) throw new CalculationInputError("The combined kit quantities must total more than zero.");
    resinCost = input.combinedPurchasePrice * resinQuantity / kitTotalBasis;
    hardenerCost = input.combinedPurchasePrice * hardenerQuantity / kitTotalBasis;
  }

  const resinAndHardenerCost = resinCost + hardenerCost;
  const expensesTotal = expenses.reduce((sum, amount) => sum + amount, 0);
  const totalMouldCost = input.costPerMould * input.mouldsUsed;
  const mouldAllocationCost = totalMouldCost * input.mouldAllocationPercent / 100;
  const totalOrderCost = resinAndHardenerCost + expensesTotal + mouldAllocationCost;
  const costPerPiece = totalOrderCost / input.orderQuantity;
  const totalSales = input.sellingPricePerPiece === undefined ? undefined : input.sellingPricePerPiece * input.orderQuantity;
  const totalProfit = totalSales === undefined ? undefined : totalSales - totalOrderCost;
  const profitPerPiece = totalProfit === undefined ? undefined : totalProfit / input.orderQuantity;

  if (![totalMixedQuantity, resinQuantity, hardenerQuantity, resinCost, hardenerCost, totalMouldCost, mouldAllocationCost, totalOrderCost, costPerPiece].every(Number.isFinite)
    || (totalSales !== undefined && !Number.isFinite(totalSales))
    || (totalProfit !== undefined && !Number.isFinite(totalProfit))) {
    throw new CalculationInputError("The entered quantities or prices are too large to calculate safely.");
  }

  return {
    cavityVolumeMl, productionCapacityPerRound, productionRounds, baseVolumeMl, allowanceVolumeMl, totalVolumeMl,
    totalMixedQuantity, quantityUnit: input.ratioBasis === "weight" ? "g" : "ml",
    resinQuantity, hardenerQuantity, resinCost, hardenerCost, resinAndHardenerCost, expensesTotal,
    totalMouldCost, mouldAllocationCost, totalOrderCost, costPerPiece, totalSales, totalProfit, profitPerPiece,
  };
}
