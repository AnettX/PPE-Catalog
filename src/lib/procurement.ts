export const VAT_RATE = 0.2;

export type Supplier = "Постачальник А" | "Постачальник Б" | "Постачальник В";

export interface CatalogItem {
  code: string;
  name: string;
  category: string;
  unit: string;
  supplier: Supplier;
  priceNet: number;
  stock: number;
}

export const CATALOG: CatalogItem[] = [
  { code: "ТМЦ-44091", name: "Каска захисна, клас Г", category: "Захист голови", unit: "шт", supplier: "Постачальник А", priceNet: 245.0, stock: 320 },
  { code: "ТМЦ-44092", name: "Підшоломник утеплений", category: "Захист голови", unit: "шт", supplier: "Постачальник Б", priceNet: 118.5, stock: 140 },
  { code: "ТМЦ-44105", name: "Костюм робочий літній", category: "Спецодяг", unit: "компл", supplier: "Постачальник Б", priceNet: 1180.0, stock: 85 },
  { code: "ТМЦ-44106", name: "Костюм робочий утеплений", category: "Спецодяг", unit: "компл", supplier: "Постачальник В", priceNet: 2350.0, stock: 42 },
  { code: "ТМЦ-44117", name: "Жилет сигнальний, 2 клас", category: "Спецодяг", unit: "шт", supplier: "Постачальник А", priceNet: 96.0, stock: 600 },
  { code: "ТМЦ-44130", name: "Черевики робочі з металевим підноском", category: "Спецвзуття", unit: "пара", supplier: "Постачальник В", priceNet: 1640.0, stock: 58 },
  { code: "ТМЦ-44131", name: "Чоботи гумові", category: "Спецвзуття", unit: "пара", supplier: "Постачальник Б", priceNet: 410.0, stock: 0 },
  { code: "ТМЦ-44148", name: "Рукавиці х/б з ПВХ-напиленням", category: "Захист рук", unit: "пара", supplier: "Постачальник А", priceNet: 14.2, stock: 4800 },
  { code: "ТМЦ-44149", name: "Рукавиці нітрилові масло-бензостійкі", category: "Захист рук", unit: "пара", supplier: "Постачальник В", priceNet: 62.0, stock: 950 },
  { code: "ТМЦ-44162", name: "Окуляри захисні відкриті", category: "Захист очей", unit: "шт", supplier: "Постачальник А", priceNet: 78.0, stock: 410 },
  { code: "ТМЦ-44175", name: "Респіратор FFP2 з клапаном", category: "Захист дихання", unit: "шт", supplier: "Постачальник Б", priceNet: 38.4, stock: 2200 },
  { code: "ТМЦ-44176", name: "Навушники протишумові", category: "Захист слуху", unit: "шт", supplier: "Постачальник В", priceNet: 312.0, stock: 12 },
  { code: "ТМЦ-44190", name: "Пояс страхувальний лямковий", category: "Висотні роботи", unit: "шт", supplier: "Постачальник А", priceNet: 1925.0, stock: 24 },
];

export type Cart = Record<string, number>;

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const priceWithVat = (priceNet: number) => round2(priceNet * (1 + VAT_RATE));

export const clampQty = (qty: number, stock: number) =>
  Math.max(0, Math.min(Math.floor(Number.isFinite(qty) ? qty : 0), stock));

export interface CartLine {
  item: CatalogItem;
  qty: number;
  sumNet: number;
  sumVat: number;
  sumGross: number;
}

export function buildLines(cart: Cart, catalog: CatalogItem[] = CATALOG): CartLine[] {
  return catalog
    .filter((item) => (cart[item.code] ?? 0) > 0)
    .map((item) => {
      const qty = cart[item.code] ?? 0;
      const sumNet = round2(item.priceNet * qty);
      const sumVat = round2(sumNet * VAT_RATE);
      return { item, qty, sumNet, sumVat, sumGross: round2(sumNet + sumVat) };
    });
}

export function cartTotals(lines: CartLine[]) {
  const net = round2(lines.reduce((s, l) => s + l.sumNet, 0));
  const vat = round2(net * VAT_RATE);
  return {
    positions: lines.length,
    units: lines.reduce((s, l) => s + l.qty, 0),
    net,
    vat,
    gross: round2(net + vat),
  };
}

const moneyFmt = new Intl.NumberFormat("uk-UA", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatMoney = (n: number) => `${moneyFmt.format(n)} ₴`;
