import * as XLSX from "xlsx";

import { VAT_RATE, cartTotals, type CartLine } from "./procurement";

export const EXPORT_HEADERS = [
  "Код ТМЦ",
  "Назва товару",
  "Кількість",
  "Ціна без ПДВ",
  "Сума без ПДВ",
  "Сума з ПДВ",
] as const;

const MONEY = "#,##0.00";

/** Builds the order workbook: one row per line with live Excel formulas for sums and totals. */
export function buildOrderWorkbook(lines: CartLine[], division: string) {
  const totals = cartTotals(lines);
  const ws: XLSX.WorkSheet = {};
  const set = (ref: string, cell: XLSX.CellObject) => (ws[ref] = cell);

  EXPORT_HEADERS.forEach((h, c) => set(XLSX.utils.encode_cell({ r: 0, c }), { t: "s", v: h }));

  lines.forEach((l, i) => {
    const r = i + 2; // Excel row number
    set(`A${r}`, { t: "s", v: l.item.code });
    set(`B${r}`, { t: "s", v: l.item.name });
    set(`C${r}`, { t: "n", v: l.qty });
    set(`D${r}`, { t: "n", v: l.item.priceNet, z: MONEY });
    set(`E${r}`, { t: "n", v: l.sumNet, f: `C${r}*D${r}`, z: MONEY });
    set(`F${r}`, { t: "n", v: l.sumGross, f: `E${r}*(1+$B$${lines.length + 5})`, z: MONEY });
  });

  const last = lines.length + 1;
  const tr = lines.length + 3; // first totals row
  set(`D${tr}`, { t: "s", v: "Разом без ПДВ" });
  set(`E${tr}`, { t: "n", v: totals.net, f: `SUM(E2:E${last})`, z: MONEY });
  set(`D${tr + 1}`, { t: "s", v: "ПДВ 20%" });
  set(`E${tr + 1}`, { t: "n", v: totals.vat, f: `E${tr}*$B$${tr + 2}`, z: MONEY });
  set(`D${tr + 2}`, { t: "s", v: "До сплати з ПДВ" });
  set(`E${tr + 2}`, { t: "n", v: totals.gross, f: `E${tr}+E${tr + 1}`, z: MONEY });
  set(`F${tr + 2}`, { t: "n", v: totals.gross, f: `SUM(F2:F${last})`, z: MONEY });
  set(`A${tr + 2}`, { t: "s", v: "Ставка ПДВ" });
  set(`B${tr + 2}`, { t: "n", v: VAT_RATE, z: "0%" });
  set(`A${tr + 3}`, { t: "s", v: "Замовник" });
  set(`B${tr + 3}`, { t: "s", v: division });

  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: tr + 2, c: 5 } });
  ws["!cols"] = [{ wch: 14 }, { wch: 42 }, { wch: 11 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заявка");
  return wb;
}

export function downloadOrderXlsx(lines: CartLine[], division: string) {
  const wb = buildOrderWorkbook(lines, division);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `Заявка_ЗІЗ_${division.replace(/[«»"\s]+/g, "_").replace(/_+$/, "")}_${date}.xlsx`;
  const data = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return filename;
}
