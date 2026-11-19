export interface LipCareIngredientInput { name: string; percentage: number; }
export interface LipCareIngredientResult extends LipCareIngredientInput { grams: number; }
export interface LipCareCalculationResult {
  batchSizeGrams: number;
  totalPercentage: number;
  ingredients: LipCareIngredientResult[];
  totalIngredientWeightGrams: number;
}

export const PERCENTAGE_TOLERANCE = 0.0001;

export function getLipCarePercentageSummary(ingredients: LipCareIngredientInput[]) {
  const totalPercentage = ingredients.reduce((sum, ingredient) =>
    sum + (Number.isFinite(ingredient.percentage) ? ingredient.percentage : 0), 0);
  const difference = 100 - totalPercentage;
  return {
    totalPercentage,
    remainingPercentage: difference > PERCENTAGE_TOLERANCE ? difference : 0,
    overagePercentage: difference < -PERCENTAGE_TOLERANCE ? Math.abs(difference) : 0,
    isBalanced: Math.abs(difference) <= PERCENTAGE_TOLERANCE,
  };
}

export class LipCareCalculationError extends Error {
  constructor(message: string) { super(message); this.name = "LipCareCalculationError"; }
}

export function calculateLipCareFormulation(
  batchSizeGrams: number,
  ingredients: LipCareIngredientInput[],
): LipCareCalculationResult {
  if (!Number.isFinite(batchSizeGrams) || batchSizeGrams <= 0)
    throw new LipCareCalculationError("Enter a batch size greater than zero grams.");
  if (!ingredients.length) throw new LipCareCalculationError("Add at least one ingredient.");
  if (ingredients.some((item) => !item.name.trim()))
    throw new LipCareCalculationError("Enter a name for every ingredient row.");
  if (ingredients.some((item) => !Number.isFinite(item.percentage) || item.percentage < 0 || item.percentage > 100))
    throw new LipCareCalculationError("Each ingredient percentage must be between 0 and 100.");

  const summary = getLipCarePercentageSummary(ingredients);
  if (!summary.isBalanced) throw new LipCareCalculationError(
    summary.remainingPercentage > 0
      ? `Your formulation is ${summary.remainingPercentage.toFixed(2)}% short of 100%.`
      : `Your formulation exceeds 100% by ${summary.overagePercentage.toFixed(2)}%.`,
  );

  const rows = ingredients.map((item) => ({ ...item, grams: batchSizeGrams * item.percentage / 100 }));
  return {
    batchSizeGrams,
    totalPercentage: summary.totalPercentage,
    ingredients: rows,
    totalIngredientWeightGrams: rows.reduce((sum, item) => sum + item.grams, 0),
  };
}
