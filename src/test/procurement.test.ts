import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";

import { EXPORT_HEADERS, buildOrderWorkbook } from "@/lib/export-xlsx";
import {
  CATALOG,
  CATEGORIES,
  buildLines,
  cartTotals,
  clampQty,
  filterCatalog,
  priceWithVat,
} from "@/lib/procurement";

describe("procurement pricing", () => {
  it("adds 20% VAT to the unit price", () => {
    expect(priceWithVat(420)).toBe(504);
  });

  it("computes net, 20% VAT and grand total for the order", () => {
    // 2 × 420.00 + 10 × 88.00 = 1 720.00 net
    const totals = cartTotals(buildLines({ "ТМЦ-44091": 2, "ТМЦ-21940": 10 }));
    expect(totals.net).toBe(1720);
    expect(totals.vat).toBe(344);
    expect(totals.gross).toBe(2064);
  });

  it("never lets quantity exceed stock or go below zero", () => {
    expect(clampQty(50, 12)).toBe(12);
    expect(clampQty(-3, 12)).toBe(0);
  });

  it("exports the required columns in order", () => {
    const wb = buildOrderWorkbook(buildLines({ "ТМЦ-44091": 2 }), "ТОВ «Буд-1»");
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets["Заявка"]!, { header: 1 });
    expect(rows[0]).toEqual([...EXPORT_HEADERS]);
    expect(rows[1]).toEqual(["ТМЦ-44091", "Каска захисна універсальна (Тип 1)", 2, 420, 840, 1008]);
  });
});

describe("catalog categories", () => {
  it("has separate head and eye protection categories", () => {
    expect(CATEGORIES).toContain("Захист голови");
    expect(CATEGORIES).toContain("Захист очей");
    expect(CATEGORIES).not.toContain("Захист голови та очей");
  });

  it("head protection filter shows the helmet but not the goggles", () => {
    const codes = filterCatalog(CATALOG, "Захист голови", "").map((i) => i.code);
    expect(codes).toEqual(["ТМЦ-44091"]);
  });

  it("eye protection filter shows the goggles but not the helmet", () => {
    const codes = filterCatalog(CATALOG, "Захист очей", "").map((i) => i.code);
    expect(codes).toEqual(["ТМЦ-55201"]);
  });

  it("every product belongs to a listed category", () => {
    for (const item of CATALOG) expect(CATEGORIES).toContain(item.category);
  });
});
