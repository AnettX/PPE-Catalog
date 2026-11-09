export const VAT_RATE = 0.2;

export type Supplier = "Постачальник А" | "Постачальник Б" | "Постачальник В";

export interface CatalogItem {
  code: string;
  name: string;
  description: string;
  category: string;
  standard: string;
  unit: string;
  supplier: Supplier;
  priceNet: number;
  stock: number;
}

export const CATEGORIES = [
  "Захист голови та очей",
  "Спецодяг",
  "Захисне взуття",
  "Захист рук",
  "Респіратори (FFP)",
  "Захист слуху",
  "Висотні роботи",
] as const;

export const CATALOG: CatalogItem[] = [
  {
    code: "ТМЦ-44091",
    name: "Каска захисна універсальна (Тип 1)",
    description: "Термостійкий ABS-пластик, регульована вентиляція, текстильне наголів'я",
    category: "Захист голови та очей",
    standard: "EN 397",
    unit: "шт",
    supplier: "Постачальник А",
    priceNet: 420,
    stock: 480,
  },
  {
    code: "ТМЦ-10823",
    name: "Костюм робочий захисний (Серія 2)",
    description: "Водовідштовхувальне просочення, щільність 245 г/м², посилені наколінники Cordura",
    category: "Спецодяг",
    standard: "ДСТУ 13688",
    unit: "компл",
    supplier: "Постачальник Б",
    priceNet: 1280,
    stock: 190,
  },
  {
    code: "ТМЦ-30214",
    name: "Черевики захисні S3 SRC (Серія 3)",
    description: "Сталевий підносок 200 Дж, кевларова антипрокольна устілка, маслобензостійка підошва",
    category: "Захисне взуття",
    standard: "EN ISO 20345",
    unit: "пара",
    supplier: "Постачальник В",
    priceNet: 1650,
    stock: 84,
  },
  {
    code: "ТМЦ-55201",
    name: "Окуляри захисні панорамні (Тип 4)",
    description: "Закритого типу, панорамна лінза, покриття проти подряпин і запітнівання",
    category: "Захист голови та очей",
    standard: "EN 166",
    unit: "шт",
    supplier: "Постачальник А",
    priceNet: 590,
    stock: 310,
  },
  {
    code: "ТМЦ-21940",
    name: "Рукавички нітрилові еластичні (Тип 5)",
    description: "Стійкі до агресивних мастил, пального та хімікатів, рельєфна протиковзка поверхня",
    category: "Захист рук",
    standard: "EN 388 4121X",
    unit: "пара",
    supplier: "Постачальник Б",
    priceNet: 88,
    stock: 1250,
  },
  {
    code: "ТМЦ-67102",
    name: "Напівмаска фільтрувальна FFP3 (Тип 6)",
    description: "Клас захисту FFP3, клапан видиху, 3-панельна складна конструкція",
    category: "Респіратори (FFP)",
    standard: "EN 149 FFP3",
    unit: "шт",
    supplier: "Постачальник В",
    priceNet: 145,
    stock: 640,
  },
  {
    code: "ТМЦ-44117",
    name: "Жилет сигнальний, 2 клас",
    description: "Флуоресцентна тканина, світловідбивні смуги 50 мм, застібка на липучці",
    category: "Спецодяг",
    standard: "EN ISO 20471",
    unit: "шт",
    supplier: "Постачальник А",
    priceNet: 96,
    stock: 600,
  },
  {
    code: "ТМЦ-44176",
    name: "Навушники протишумові",
    description: "Зниження шуму SNR 30 дБ, регульоване оголів'я, м'які амбушури",
    category: "Захист слуху",
    standard: "EN 352-1",
    unit: "шт",
    supplier: "Постачальник В",
    priceNet: 312,
    stock: 12,
  },
  {
    code: "ТМЦ-44190",
    name: "Пояс страхувальний лямковий",
    description: "П'ять точок кріплення, регулювання за зростом, сталеві D-кільця",
    category: "Висотні роботи",
    standard: "EN 361",
    unit: "шт",
    supplier: "Постачальник Б",
    priceNet: 1925,
    stock: 0,
  },
];

export const LOW_STOCK_THRESHOLD = 50;

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

export const formatMoney = (n: number) => `${moneyFmt.format(n)}\u00a0₴`;
export const formatAmount = (n: number) => moneyFmt.format(n);

const pad = (n: number) => String(n).padStart(2, "0");

/** Specification number derived from the moment the form was generated. */
export const specNumber = (d: Date) =>
  `ЗВ-${d.getFullYear()}/ЗІЗ-${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;

export const formatDateTime = (d: Date) =>
  `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function orderFilename(division: string, d: Date) {
  const div = division.replace(/[«»"\s]+/g, "_").replace(/^_+|_+$/g, "");
  return `Заявка_ЗІЗ_${div}_${isoDate(d)}.xlsx`;
}

/** Plain-text (tab-separated) version of the order for pasting into mail or a spreadsheet. */
export function buildOrderText(lines: CartLine[], division: string, d: Date) {
  const t = cartTotals(lines);
  const rows = [
    `Заявка на ЗІЗ № ${specNumber(d)} від ${formatDateTime(d)}`,
    `Замовник: ${division}`,
    "",
    ["Код ТМЦ", "Назва товару", "Кількість", "Ціна без ПДВ", "Сума без ПДВ", "Сума з ПДВ"].join("\t"),
    ...lines.map((l) =>
      [l.item.code, l.item.name, l.qty, formatAmount(l.item.priceNet), formatAmount(l.sumNet), formatAmount(l.sumGross)].join("\t"),
    ),
    "",
    `Разом без ПДВ: ${formatMoney(t.net)}`,
    `ПДВ 20%: ${formatMoney(t.vat)}`,
    `До сплати: ${formatMoney(t.gross)}`,
  ];
  return rows.join("\n");
}
