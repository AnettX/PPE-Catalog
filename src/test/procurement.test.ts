import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import { EXPORT_HEADERS, buildOrderWorkbook } from "@/lib/export-xlsx";
import { buildLines, cartTotals, clampQty, priceWithVat } from "@/lib/procurement";

describe("procurement pricing", () => {
  it("adds 20% VAT to the unit price", () => {
    expect(priceWithVat(245)).toBe(294);
  });

  it("computes net, 20% VAT and grand total for the order", () => {
    // 2 × 245.00 + 10 × 14.20 = 632.00 net
    const totals = cartTotals(buildLines({ "ТМЦ-44091": 2, "ТМЦ-44148": 10 }));
    expect(totals.net).toBe(632);
    expect(totals.vat).toBe(126.4);
    expect(totals.gross).toBe(758.4);
  });

  it("never lets quantity exceed stock or go below zero", () => {
    expect(clampQty(50, 12)).toBe(12);
    expect(clampQty(-3, 12)).toBe(0);
  });

  it("exports the required columns in order", () => {
    const wb = buildOrderWorkbook(buildLines({ "ТМЦ-44091": 2 }), "ТОВ «Буд-1»");
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets["Заявка"]!, { header: 1 });
    expect(rows[0]).toEqual([...EXPORT_HEADERS]);
    expect(rows[1]).toEqual(["ТМЦ-44091", "Каска захисна, клас Г", 2, 245, 490, 588]);
  });
});
