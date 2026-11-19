import test from "node:test";
import assert from "node:assert/strict";
import { calculateCavityVolumeMl, calculateResinProject, CalculationInputError } from "./calculations.ts";

const base = {
  shape: "round",
  unit: "cm",
  diameter: 2,
  depth: 1,
  cavities: 4,
  pieces: 20,
  allowancePercent: 0,
  ratioBasis: "volume",
  ratio: "2:1",
  resinPurchaseQuantity: 1000,
  resinPurchaseCost: 20000,
  hardenerPurchaseQuantity: 1000,
  hardenerPurchaseCost: 10000,
  expenses: { accessories: 0, pigments: 0, decorative: 0, customisation: 0, packaging: 0, labourOther: 0 },
  mouldPurchaseCost: 10000,
  mouldAllocation: "10",
};

test("calculates circular cavity volume in ml", () => {
  assert.ok(Math.abs(calculateCavityVolumeMl(base) - Math.PI) < 1e-10);
});

test("converts millimetres and inches into the same internal unit", () => {
  const cm = calculateCavityVolumeMl({ ...base, shape: "rectangle", length: 2, width: 3, depth: 1 });
  const mm = calculateCavityVolumeMl({ ...base, shape: "rectangle", unit: "mm", length: 20, width: 30, depth: 10 });
  const inches = calculateCavityVolumeMl({ ...base, shape: "rectangle", unit: "in", length: 2 / 2.54, width: 3 / 2.54, depth: 1 / 2.54 });
  assert.ok(Math.abs(cm - mm) < 1e-10);
  assert.ok(Math.abs(cm - inches) < 1e-10);
});

test("calculates square, rectangle, oval and irregular capacities", () => {
  assert.equal(calculateCavityVolumeMl({ ...base, shape: "square", length: 2, width: 2 }), 4);
  assert.equal(calculateCavityVolumeMl({ ...base, shape: "rectangle", length: 2, width: 3 }), 6);
  assert.ok(Math.abs(calculateCavityVolumeMl({ ...base, shape: "oval", length: 2, width: 2 }) - Math.PI) < 1e-10);
  assert.equal(calculateCavityVolumeMl({ ...base, shape: "irregular", waterCapacityMl: 17 }), 17);
});

test("uses pieces for total volume and cavities only for production rounds", () => {
  const result = calculateResinProject(base);
  assert.ok(Math.abs(result.baseVolumeMl - Math.PI * 20) < 1e-10);
  assert.equal(result.productionRounds, 5);
});

test("splits volume by the selected resin-to-hardener ratio", () => {
  const result = calculateResinProject({ ...base, shape: "rectangle", length: 2, width: 3, depth: 1, pieces: 1 });
  assert.equal(result.totalMixedQuantity, 6);
  assert.equal(result.resinQuantity, 4);
  assert.equal(result.hardenerQuantity, 2);
});

test("supports all listed resin-to-hardener ratios", () => {
  const dimensions = { ...base, shape: "rectangle", length: 2, width: 3, depth: 1, pieces: 1 };
  const equal = calculateResinProject({ ...dimensions, ratio: "1:1" });
  const threeToOne = calculateResinProject({ ...dimensions, ratio: "3:1" });
  assert.equal(equal.resinQuantity, 3);
  assert.equal(equal.hardenerQuantity, 3);
  assert.equal(threeToOne.resinQuantity, 4.5);
  assert.equal(threeToOne.hardenerQuantity, 1.5);
});

test("requires manufacturer density for weight basis and converts total mix mass", () => {
  assert.throws(() => calculateResinProject({ ...base, ratioBasis: "weight" }), CalculationInputError);
  assert.throws(() => calculateResinProject({ ...base, ratioBasis: "weight", mixedSystemDensity: 0 }), CalculationInputError);
  const result = calculateResinProject({ ...base, shape: "rectangle", length: 2, width: 3, depth: 1, pieces: 1, ratioBasis: "weight", mixedSystemDensity: 1.2 });
  assert.ok(Math.abs(result.totalMixedQuantity - 7.2) < 1e-10);
  assert.ok(Math.abs(result.resinQuantity - 4.8) < 1e-10);
  assert.ok(Math.abs(result.hardenerQuantity - 2.4) < 1e-10);
});

test("applies allowance and mould allocation to project cost", () => {
  const result = calculateResinProject({ ...base, shape: "rectangle", length: 2, width: 3, depth: 1, pieces: 1, allowancePercent: 10, mouldAllocation: "10" });
  assert.ok(Math.abs(result.totalVolumeMl - 6.6) < 1e-10);
  assert.equal(result.mouldAllocationCost, 1000);
  assert.equal(result.expensesTotal, 0);
});

test("supports a custom mould allocation percentage", () => {
  const result = calculateResinProject({ ...base, shape: "rectangle", length: 2, width: 3, depth: 1, pieces: 1, mouldAllocation: "custom", customMouldAllocationPercent: 7.5 });
  assert.equal(result.mouldAllocationCost, 750);
});

test("calculates expense totals, cost per piece and profit", () => {
  const result = calculateResinProject({
    ...base, shape: "rectangle", length: 2, width: 3, depth: 1, pieces: 2,
    expenses: { accessories: 100, pigments: 200, decorative: 0, customisation: 0, packaging: 50, labourOther: 150 },
    sellingPricePerPiece: 1000,
  });
  assert.equal(result.expensesTotal, 500);
  assert.equal(result.totalSales, 2000);
  assert.equal(result.totalProfit, result.totalSales - result.totalOrderCost);
  assert.equal(result.isSellingPriceBelowCost, result.costPerPiece > 1000);
});

test("rejects invalid cavity counts and negative expenses", () => {
  assert.throws(() => calculateResinProject({ ...base, cavities: 0 }), CalculationInputError);
  assert.throws(() => calculateResinProject({ ...base, expenses: { ...base.expenses, labourOther: -1 } }), CalculationInputError);
});
