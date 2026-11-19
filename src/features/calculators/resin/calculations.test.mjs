import test from "node:test";
import assert from "node:assert/strict";
import { calculateCavityVolumeMl, calculateResinProject, CalculationInputError } from "./calculations.ts";

const base = {
  shape: "rectangle", unit: "cm", length: 2, width: 3, depth: 1,
  cavitiesPerMould: 2, mouldsUsed: 2, orderQuantity: 5, allowancePercent: 0,
  ratioBasis: "volume", resinRatioParts: 2, hardenerRatioParts: 1,
  purchaseMethod: "separate",
  resinPurchaseQuantity: 100, resinPurchaseUnit: "ml", resinPurchasePrice: 1000,
  hardenerPurchaseQuantity: 100, hardenerPurchaseUnit: "ml", hardenerPurchasePrice: 500,
  combinedPurchasePrice: 1500,
  expenses: { accessories: 0, pigments: 0, decorative: 0, customisation: 0, packaging: 0, labourOther: 0 },
  costPerMould: 1000, mouldAllocationPercent: 2,
};

test("calculates round, square, rectangular, oval and irregular cavity volumes", () => {
  assert.ok(Math.abs(calculateCavityVolumeMl({ ...base, shape: "round", diameter: 2 }) - Math.PI) < 1e-10);
  assert.equal(calculateCavityVolumeMl({ ...base, shape: "square", length: 2, width: 2 }), 4);
  assert.equal(calculateCavityVolumeMl(base), 6);
  assert.ok(Math.abs(calculateCavityVolumeMl({ ...base, shape: "oval", length: 2, width: 2 }) - Math.PI) < 1e-10);
  assert.equal(calculateCavityVolumeMl({ ...base, shape: "irregular", waterCapacityMl: 17 }), 17);
});

test("normalises millimetres and inches before calculating volume", () => {
  const cm = calculateCavityVolumeMl(base);
  const mm = calculateCavityVolumeMl({ ...base, unit: "mm", length: 20, width: 30, depth: 10 });
  const inches = calculateCavityVolumeMl({ ...base, unit: "in", length: 2 / 2.54, width: 3 / 2.54, depth: 1 / 2.54 });
  assert.ok(Math.abs(cm - mm) < 1e-10);
  assert.ok(Math.abs(cm - inches) < 1e-10);
});

test("uses cavities per mould and moulds used for rounds, not resin volume", () => {
  const result = calculateResinProject(base);
  assert.equal(result.productionCapacityPerRound, 4);
  assert.equal(result.productionRounds, 2);
  assert.equal(result.baseVolumeMl, 30);
  assert.equal(result.totalVolumeMl, 30);
});

test("one mould reused across multiple rounds does not multiply material or mould costs", () => {
  const result = calculateResinProject({ ...base, cavitiesPerMould: 2, mouldsUsed: 1, orderQuantity: 5 });
  assert.equal(result.productionRounds, 3);
  assert.equal(result.baseVolumeMl, 30);
  assert.equal(result.totalMouldCost, 1000);
});

test("calculates material quantities and costs using a volume ratio", () => {
  const result = calculateResinProject({ ...base, orderQuantity: 1 });
  assert.equal(result.totalMixedQuantity, 6);
  assert.equal(result.resinQuantity, 4);
  assert.equal(result.hardenerQuantity, 2);
  assert.equal(result.resinCost, 40);
  assert.equal(result.hardenerCost, 10);
});

test("applies extra allowance once to the full order requirement", () => {
  const result = calculateResinProject({ ...base, orderQuantity: 5, allowancePercent: 10 });
  assert.equal(result.baseVolumeMl, 30);
  assert.equal(result.allowanceVolumeMl, 3);
  assert.equal(result.totalVolumeMl, 33);
});

test("uses mixed-system density only to convert mould volume to a weight-based total", () => {
  assert.throws(() => calculateResinProject({ ...base, ratioBasis: "weight" }), CalculationInputError);
  const result = calculateResinProject({
    ...base, orderQuantity: 1, ratioBasis: "weight", mixedSystemDensity: 1.2,
    resinPurchaseUnit: "g", hardenerPurchaseUnit: "g",
  });
  assert.ok(Math.abs(result.totalMixedQuantity - 7.2) < 1e-10);
  assert.ok(Math.abs(result.resinQuantity - 4.8) < 1e-10);
  assert.ok(Math.abs(result.hardenerQuantity - 2.4) < 1e-10);
});

test("converts separate purchase units only when component density is supplied", () => {
  assert.throws(() => calculateResinProject({ ...base, orderQuantity: 1, resinPurchaseUnit: "g" }), /resin density/);
  const result = calculateResinProject({
    ...base, orderQuantity: 1, resinPurchaseUnit: "g", resinDensity: 1.1,
    hardenerPurchaseUnit: "g", hardenerDensity: 1.2,
  });
  assert.ok(Math.abs(result.resinCost - 44) < 1e-10);
  assert.ok(Math.abs(result.hardenerCost - 12) < 1e-10);
});

test("prices only consumed quantities from a combined kit", () => {
  const result = calculateResinProject({ ...base, orderQuantity: 1, purchaseMethod: "combined" });
  assert.equal(result.resinCost, 40);
  assert.equal(result.hardenerCost, 20);
  assert.equal(result.resinAndHardenerCost, 60);
  assert.ok(result.resinAndHardenerCost < base.combinedPurchasePrice);
});

test("converts combined kit component quantities into the selected ratio basis", () => {
  const result = calculateResinProject({
    ...base, orderQuantity: 1, purchaseMethod: "combined",
    resinPurchaseUnit: "g", resinDensity: 1.1,
    hardenerPurchaseUnit: "g", hardenerDensity: 1.2,
  });
  assert.ok(Math.abs(result.resinCost - (1500 * 4 / (100 / 1.1 + 100 / 1.2))) < 1e-10);
});

test("calculates expenses and mould allocation from physical mould count", () => {
  const result = calculateResinProject({
    ...base, expenses: { accessories: 100, pigments: 200, decorative: 50, customisation: 0, packaging: 75, labourOther: 25 },
  });
  assert.equal(result.expensesTotal, 450);
  assert.equal(result.totalMouldCost, 2000);
  assert.equal(result.mouldAllocationCost, 40);
});

test("calculates total sales and preserves negative profit", () => {
  const result = calculateResinProject({ ...base, orderQuantity: 1, sellingPricePerPiece: 1 });
  assert.equal(result.totalSales, 1);
  assert.ok((result.totalProfit ?? 0) < 0);
  assert.ok((result.profitPerPiece ?? 0) < 0);
});

test("rejects invalid counts, ratios, expenses, densities and allocation", () => {
  assert.throws(() => calculateResinProject({ ...base, cavitiesPerMould: 0 }), CalculationInputError);
  assert.throws(() => calculateResinProject({ ...base, mouldsUsed: 0 }), CalculationInputError);
  assert.throws(() => calculateResinProject({ ...base, orderQuantity: 0 }), CalculationInputError);
  assert.throws(() => calculateResinProject({ ...base, resinRatioParts: 0 }), CalculationInputError);
  assert.throws(() => calculateResinProject({ ...base, expenses: { ...base.expenses, labourOther: -1 } }), CalculationInputError);
  assert.throws(() => calculateResinProject({ ...base, mouldAllocationPercent: 101 }), CalculationInputError);
});
