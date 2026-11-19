import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateLipCareFormulation,
  calculateManualMeasurements,
  getLipCarePercentageSummary,
  LipCareCalculationError,
} from "./calculations.ts";

test("calculates ingredient weights from batch size and percentages", () => {
  const result = calculateLipCareFormulation(200, [{ name: "A", percentage: 25 }, { name: "B", percentage: 75 }]);
  assert.deepEqual(result.ingredients.map((item) => item.grams), [50, 150]);
  assert.equal(result.totalIngredientWeightGrams, 200);
});

test("accepts decimal percentages that total 100 within floating-point tolerance", () => {
  const result = calculateLipCareFormulation(50, [
    { name: "A", percentage: 33.33 }, { name: "B", percentage: 33.33 }, { name: "C", percentage: 33.34 },
  ]);
  assert.equal(result.totalPercentage, 100);
  assert.ok(Math.abs(result.totalIngredientWeightGrams - 50) < 1e-10);
});

test("reports remaining percentage and blocks incomplete formulations", () => {
  const rows = [{ name: "A", percentage: 40 }, { name: "B", percentage: 50 }];
  assert.equal(getLipCarePercentageSummary(rows).remainingPercentage, 10);
  assert.throws(() => calculateLipCareFormulation(100, rows), LipCareCalculationError);
});

test("reports excess percentage and blocks formulations above 100", () => {
  const rows = [{ name: "A", percentage: 60 }, { name: "B", percentage: 45 }];
  assert.equal(getLipCarePercentageSummary(rows).overagePercentage, 5);
  assert.throws(() => calculateLipCareFormulation(100, rows), LipCareCalculationError);
});

test("rejects invalid batch sizes, blank names and non-positive percentages", () => {
  assert.throws(() => calculateLipCareFormulation(0, [{ name: "A", percentage: 100 }]), LipCareCalculationError);
  assert.throws(() => calculateLipCareFormulation(100, [{ name: " ", percentage: 100 }]), LipCareCalculationError);
  assert.throws(() => calculateLipCareFormulation(100, [{ name: "A", percentage: 0 }]), LipCareCalculationError);
  assert.throws(() => calculateLipCareFormulation(100, [{ name: "A", percentage: 101 }]), LipCareCalculationError);
});

test("manual measurements preserve values and subtotal only matching units", () => {
  const result = calculateManualMeasurements([
    { name: "A", quantity: 2.5, unit: "g" },
    { name: "B", quantity: 3, unit: "ml" },
    { name: "C", quantity: 2, unit: "tsp" },
    { name: "D", quantity: 1, unit: "tbsp" },
    { name: "E", quantity: 0.5, unit: "cup" },
    { name: "F", quantity: 10, unit: "drop" },
    { name: "G", quantity: 1.5, unit: "g" },
  ]);
  assert.equal(result.subtotals.g, 4);
  assert.equal(result.subtotals.ml, 3);
  assert.equal(result.subtotals.tsp, 2);
  assert.equal(result.subtotals.tbsp, 1);
  assert.equal(result.subtotals.cup, 0.5);
  assert.equal(result.subtotals.drop, 10);
  assert.equal(result.ingredients[0].quantity, 2.5);
});

test("manual mode does not convert grams to millilitres or imply a total gram weight", () => {
  const result = calculateManualMeasurements([
    { name: "A", quantity: 10, unit: "g" }, { name: "B", quantity: 10, unit: "ml" },
  ]);
  assert.equal(result.subtotals.g, 10);
  assert.equal(result.subtotals.ml, 10);
  assert.equal(Object.keys(result.subtotals).length, 6);
});

test("manual mode rejects blank names, zero and negative quantities", () => {
  assert.throws(() => calculateManualMeasurements([{ name: "", quantity: 2, unit: "g" }]), LipCareCalculationError);
  assert.throws(() => calculateManualMeasurements([{ name: "A", quantity: 0, unit: "g" }]), LipCareCalculationError);
  assert.throws(() => calculateManualMeasurements([{ name: "A", quantity: -1, unit: "g" }]), LipCareCalculationError);
});
