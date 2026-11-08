import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, HardHat, PackageOpen, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { QtyStepper } from "@/components/procurement/QtyStepper";
import { Button } from "@/components/ui/button";
import { downloadOrderXlsx } from "@/lib/export-xlsx";
import {
  CATALOG,
  buildLines,
  cartTotals,
  clampQty,
  formatMoney,
  priceWithVat,
  type Cart,
} from "@/lib/procurement";
import { cn } from "@/lib/utils";

const HOLDING = "ТОВ «БУД-АЛЬЯНС»";
const DIVISION = "ТОВ «Буд-1»";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Каталог ЗІЗ і заявка — ТОВ «БУД-АЛЬЯНС»" },
      {
        name: "description",
        content: "Каталог засобів індивідуального захисту, формування заявки та вивантаження в Excel.",
      },
      { property: "og:title", content: "Каталог ЗІЗ і заявка — ТОВ «БУД-АЛЬЯНС»" },
      {
        property: "og:description",
        content: "Каталог засобів індивідуального захисту, формування заявки та вивантаження в Excel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProcurementPage,
});

const CATEGORIES = ["Усі", ...Array.from(new Set(CATALOG.map((i) => i.category)))];

function ProcurementPage() {
  const [cart, setCart] = useState<Cart>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Усі");

  const setQty = (code: string, qty: number) => {
    const item = CATALOG.find((i) => i.code === code);
    if (!item) return;
    setCart((prev) => {
      const next = { ...prev };
      const q = clampQty(qty, item.stock);
      if (q === 0) delete next[code];
      else next[code] = q;
      return next;
    });
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter(
      (i) =>
        (category === "Усі" || i.category === category) &&
        (!q || i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q)),
    );
  }, [query, category]);

  const lines = useMemo(() => buildLines(cart), [cart]);
  const totals = useMemo(() => cartTotals(lines), [lines]);

  const handleExport = () => {
    if (!lines.length) return;
    const filename = downloadOrderXlsx(lines, DIVISION);
    toast.success("Заявку вивантажено", { description: filename });
  };

  return (
    <div className="flex h-screen min-w-[1180px] flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-brand text-brand-foreground">
            <HardHat className="size-4.5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">{HOLDING}</div>
            <div className="text-xs text-muted-foreground">Портал закупівель ЗІЗ</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-xs font-medium text-success">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            ERP підключено
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="leading-tight">
            <div className="text-xs text-muted-foreground">Підрозділ-замовник</div>
            <div className="text-sm font-medium">{DIVISION}</div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Catalog */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-end justify-between gap-6 px-6 pt-6 pb-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Каталог ТМЦ</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {visible.length} з {CATALOG.length} позицій · ціни в гривнях
              </p>
            </div>
            <div className="relative w-80">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Пошук за кодом, назвою, постачальником"
                className="h-9 w-full rounded-md border border-input bg-card pr-8 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Очистити пошук"
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-1.5 px-6 pb-4">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-6 pb-6">
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted text-xs text-muted-foreground">
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-2.5 font-medium">Код ТМЦ</th>
                    <th className="px-4 py-2.5 font-medium">Найменування</th>
                    <th className="px-4 py-2.5 font-medium">Постачальник</th>
                    <th className="px-4 py-2.5 text-right font-medium">Ціна без ПДВ</th>
                    <th className="px-4 py-2.5 text-right font-medium">Ціна з ПДВ</th>
                    <th className="px-4 py-2.5 text-right font-medium">Залишок</th>
                    <th className="w-44 px-4 py-2.5 text-right font-medium">Дія</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const qty = cart[item.code] ?? 0;
                    const out = item.stock === 0;
                    return (
                      <tr
                        key={item.code}
                        className={cn(
                          "border-b border-border last:border-0 transition-colors",
                          qty > 0 ? "bg-brand-soft/60" : "hover:bg-muted/50",
                        )}
                      >
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                          {item.code}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.category} · {item.unit}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{item.supplier}</td>
                        <td className="tabular px-4 py-3 text-right whitespace-nowrap">
                          {formatMoney(item.priceNet)}
                        </td>
                        <td className="tabular px-4 py-3 text-right whitespace-nowrap text-muted-foreground">
                          {formatMoney(priceWithVat(item.priceNet))}
                        </td>
                        <td
                          className={cn(
                            "tabular px-4 py-3 text-right whitespace-nowrap",
                            out ? "text-destructive" : item.stock < 50 ? "text-warning" : "",
                          )}
                        >
                          {out ? "Немає" : `${item.stock.toLocaleString("uk-UA")} ${item.unit}`}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {qty > 0 ? (
                            <QtyStepper
                              value={qty}
                              max={item.stock}
                              label={item.name}
                              onChange={(q) => setQty(item.code, q)}
                            />
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={out}
                              onClick={() => setQty(item.code, 1)}
                            >
                              Додати в заявку
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        Нічого не знайдено
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Order panel */}
        <aside className="flex w-[400px] shrink-0 flex-col border-l border-border bg-card shadow-panel">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Поточна заявка</h2>
              <p className="text-xs text-muted-foreground">
                {totals.positions} поз. · {totals.units.toLocaleString("uk-UA")} од.
              </p>
            </div>
            {lines.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setCart({})}>
                <Trash2 /> Очистити
              </Button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {lines.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                  <PackageOpen className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Заявка порожня. Додайте позиції з каталогу.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {lines.map((l) => (
                  <li key={l.item.code} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] text-muted-foreground">{l.item.code}</div>
                        <div className="truncate text-sm font-medium">{l.item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatMoney(l.item.priceNet)} / {l.item.unit} · {l.item.supplier}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Видалити: ${l.item.name}`}
                        onClick={() => setQty(l.item.code, 0)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper
                        size="sm"
                        value={l.qty}
                        max={l.item.stock}
                        label={l.item.name}
                        onChange={(q) => setQty(l.item.code, q)}
                      />
                      <div className="tabular text-sm font-semibold">{formatMoney(l.sumNet)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="shrink-0 border-t border-border bg-muted/40 px-5 py-4">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Сума без ПДВ</dt>
                <dd className="tabular">{formatMoney(totals.net)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">ПДВ 20%</dt>
                <dd className="tabular">{formatMoney(totals.vat)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-2.5">
                <dt className="font-medium">До сплати</dt>
                <dd className="tabular text-xl font-semibold tracking-tight">{formatMoney(totals.gross)}</dd>
              </div>
            </dl>
            <Button
              className="mt-4 h-10 w-full"
              disabled={lines.length === 0}
              onClick={handleExport}
            >
              <FileSpreadsheet /> Вивантажити заявку в Excel (.xlsx)
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
