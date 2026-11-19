import test from "node:test";
import assert from "node:assert/strict";
import { calculateLipCareFormulation, getLipCarePercentageSummary, LipCareCalculationError } from "./calculations.ts";

test("calculates ingredient weights from batch size and percentages", () => {
  const result = calculateLipCareFormulation(200, [{ name: "A", percentage: 25 }, { name: "B", percentage: 75 }]);
  assert.deepEqual(result.ingredients.map((item) => item.grams), [50, 150]);
  assert.equal(result.totalIngredientWeightGrams, 200);
});

test("accepts decimal percentages totalling 100 and preserves batch weight", () => {
  const result = calculateLipCareFormulation(50, [
    { name: "A", percentage: 33.33 }, { name: "B", percentage: 33.33 }, { name: "C", percentage: 33.34 },
  ]);
  assert.equal(result.totalPercentage, 100);
  assert.ok(Math.abs(result.totalIngredientWeightGrams - 50) < 1e-10);
});

test("treats binary floating point noise as balanced", () => {
  assert.equal(getLipCarePercentageSummary([
    { name: "A", percentage: 0.1 }, { name: "B", percentage: 0.2 }, { name: "C", percentage: 99.7 },
  ]).isBalanced, true);
});

test("reports a remaining percentage and blocks incomplete formulation", () => {
  const rows = [{ name: "A", percentage: 40 }, { name: "B", percentage: 50 }];
  assert.equal(getLipCarePercentageSummary(rows).remainingPercentage, 10);
  assert.throws(() => calculateLipCareFormulation(100, rows), LipCareCalculationError);
});

test("reports overage and blocks excessive formulation", () => {
  const rows = [{ name: "A", percentage: 60 }, { name: "B", percentage: 45 }];
  assert.equal(getLipCarePercentageSummary(rows).overagePercentage, 5);
  assert.throws(() => calculateLipCareFormulation(100, rows), LipCareCalculationError);
});

test("rejects invalid batch size, missing ingredient names and invalid percentages", () => {
  assert.throws(() => calculateLipCareFormulation(0, [{ name: "A", percentage: 100 }]), LipCareCalculationError);
  assert.throws(() => calculateLipCareFormulation(100, [{ name: " ", percentage: 100 }]), LipCareCalculationError);
  assert.throws(() => calculateLipCareFormulation(100, [{ name: "A", percentage: -1 }]), LipCareCalculationError);
  assert.throws(() => calculateLipCareFormulation(100, [{ name: "A", percentage: 101 }]), LipCareCalculationError);
});
