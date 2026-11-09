import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck, FileText, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/procurement/AppHeader";
import { ExportPreviewDialog } from "@/components/procurement/ExportPreviewDialog";
import { OrderPanel } from "@/components/procurement/OrderPanel";
import { ProductCard } from "@/components/procurement/ProductCard";
import { Button } from "@/components/ui/button";
import { downloadOrderXlsx } from "@/lib/export-xlsx";
import {
  ALL_CATEGORIES,
  CATALOG,
  CATEGORIES,
  buildLines,
  buildOrderText,
  clampQty,
  filterCatalog,
  type Cart,
} from "@/lib/procurement";
import { cn } from "@/lib/utils";

const HOLDING = "ТОВ «БУД-АЛЬЯНС»";
const DIVISION = "ТОВ «Буд-1»";
const ALL = ALL_CATEGORIES;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Каталог ЗІЗ" },
      {
        name: "description",
        content: "Каталог засобів індивідуального захисту, формування заявки та вивантаження в Excel.",
      },
      { property: "og:title", content: "Каталог ЗІЗ" },
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

function ProcurementPage() {
  const [cart, setCart] = useState<Cart>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAt, setPreviewAt] = useState<Date>(() => new Date(0));

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

  const visible = useMemo(() => filterCatalog(CATALOG, category, query), [query, category]);

  const lines = useMemo(() => buildLines(cart), [cart]);

  const exportXlsx = (at = new Date()) => {
    if (!lines.length) return;
    const filename = downloadOrderXlsx(lines, DIVISION, at);
    toast.success("Заявку вивантажено", { description: filename });
  };

  const openPreview = () => {
    setPreviewAt(new Date());
    setPreviewOpen(true);
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(buildOrderText(lines, DIVISION, new Date()));
      toast.success("Текст заявки скопійовано");
    } catch {
      toast.error("Не вдалося скопіювати — дозвольте доступ до буфера обміну");
    }
  };

  return (
    <div className="min-h-screen min-w-[1024px]">
      <AppHeader holding={HOLDING} division={DIVISION} />

      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_320px] items-start gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:px-10">
        <main className="min-w-0">
          <h1 className="text-2xl leading-8 font-semibold tracking-[-0.02em] xl:text-[1.75rem] xl:leading-9">
            Засоби індивідуального захисту
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-success-border bg-success-soft px-2.5 font-display text-xs font-medium text-success-foreground">
              <CircleCheck className="size-3.5" /> 100% відповідність ДСТУ EN / ISO
            </span>
            <Button variant="secondary" size="sm" onClick={openPreview}>
              <FileText /> Бланк специфікації
            </Button>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="micro mr-1.5 text-muted-foreground">Категорії:</span>
              {[ALL, ...CATEGORIES].map((c) => {
                const label = c === ALL ? `Всі позиції (${CATALOG.length})` : c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "h-7 rounded-sm px-3 font-display text-xs font-medium transition-colors",
                      category === c
                        ? "bg-ink text-ink-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Пошук номенклатури, ТМЦ, EN…"
                  className="h-9 w-full rounded-sm border border-transparent bg-muted pr-8 pl-9 text-sm outline-none placeholder:text-subtle-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/15"
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
              <span className="shrink-0 text-xs text-muted-foreground">
                Знайдено: <span className="data font-semibold text-foreground">{visible.length}</span> поз.
              </span>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-border-strong bg-card px-6 py-16 text-center text-sm text-muted-foreground">
              Нічого не знайдено. Змініть запит або категорію.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-4 2xl:grid-cols-4">
              {visible.map((item) => (
                <ProductCard
                  key={item.code}
                  item={item}
                  qty={cart[item.code] ?? 0}
                  onQty={(q) => setQty(item.code, q)}
                />
              ))}
            </div>
          )}
        </main>

        <aside className="sticky top-20">
          <OrderPanel
            lines={lines}
            division={DIVISION}
            holding={HOLDING}
            onQty={setQty}
            onClear={() => setCart({})}
            onExport={() => exportXlsx()}
            onPreview={openPreview}
            onCopy={copyText}
          />
        </aside>
      </div>

      <ExportPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        lines={lines}
        division={DIVISION}
        createdAt={previewAt}
        onDownload={() => exportXlsx(previewAt)}
      />
    </div>
  );
}
