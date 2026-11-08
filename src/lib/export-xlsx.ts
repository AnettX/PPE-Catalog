import * as XLSX from "xlsx";

import {
  VAT_RATE,
  cartTotals,
  formatDateTime,
  orderFilename,
  specNumber,
  type CartLine,
} from "./procurement";

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
export function buildOrderWorkbook(lines: CartLine[], division: string, createdAt = new Date()) {
  const totals = cartTotals(lines);
  const ws: XLSX.WorkSheet = {};
  const set = (ref: string, cell: XLSX.CellObject) => (ws[ref] = cell);

  const tr = lines.length + 3; // first totals row (Excel numbering)
  const rateRef = `$B$${tr + 2}`;

  EXPORT_HEADERS.forEach((h, c) => set(XLSX.utils.encode_cell({ r: 0, c }), { t: "s", v: h }));

  lines.forEach((l, i) => {
    const r = i + 2;
    set(`A${r}`, { t: "s", v: l.item.code });
    set(`B${r}`, { t: "s", v: l.item.name });
    set(`C${r}`, { t: "n", v: l.qty });
    set(`D${r}`, { t: "n", v: l.item.priceNet, z: MONEY });
    set(`E${r}`, { t: "n", v: l.sumNet, f: `C${r}*D${r}`, z: MONEY });
    set(`F${r}`, { t: "n", v: l.sumGross, f: `E${r}*(1+${rateRef})`, z: MONEY });
  });

  const last = lines.length + 1;
  set(`D${tr}`, { t: "s", v: "Разом без ПДВ" });
  set(`E${tr}`, { t: "n", v: totals.net, f: `SUM(E2:E${last})`, z: MONEY });
  set(`D${tr + 1}`, { t: "s", v: "ПДВ 20%" });
  set(`E${tr + 1}`, { t: "n", v: totals.vat, f: `E${tr}*${rateRef}`, z: MONEY });
  set(`D${tr + 2}`, { t: "s", v: "До сплати з ПДВ" });
  set(`E${tr + 2}`, { t: "n", v: totals.gross, f: `E${tr}+E${tr + 1}`, z: MONEY });
  set(`F${tr + 2}`, { t: "n", v: totals.gross, f: `SUM(F2:F${last})`, z: MONEY });

  set(`A${tr + 2}`, { t: "s", v: "Ставка ПДВ" });
  set(`B${tr + 2}`, { t: "n", v: VAT_RATE, z: "0%" });
  set(`A${tr + 3}`, { t: "s", v: "Замовник" });
  set(`B${tr + 3}`, { t: "s", v: division });
  set(`A${tr + 4}`, { t: "s", v: "Бланк №" });
  set(`B${tr + 4}`, { t: "s", v: specNumber(createdAt) });
  set(`A${tr + 5}`, { t: "s", v: "Сформовано" });
  set(`B${tr + 5}`, { t: "s", v: formatDateTime(createdAt) });

  // encode_range is 0-based: r = tr + 4 is Excel row tr + 5 (the last info row)
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: tr + 4, c: 5 } });
  ws["!cols"] = [{ wch: 14 }, { wch: 42 }, { wch: 11 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заявка");
  return wb;
}

export function downloadOrderXlsx(lines: CartLine[], division: string, createdAt = new Date()) {
  const wb = buildOrderWorkbook(lines, division, createdAt);
  const filename = orderFilename(division, createdAt);
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
