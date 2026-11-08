import { ClipboardList, Copy, Download, FileSearch, ListX, PackageOpen, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cartTotals, formatMoney, type CartLine } from "@/lib/procurement";

import { TmcBadge } from "./badges";
import { QtyStepper } from "./QtyStepper";

interface OrderPanelProps {
  lines: CartLine[];
  division: string;
  holding: string;
  onQty: (code: string, qty: number) => void;
  onClear: () => void;
  onExport: () => void;
  onPreview: () => void;
  onCopy: () => void;
}

export function OrderPanel({
  lines,
  division,
  holding,
  onQty,
  onClear,
  onExport,
  onPreview,
  onCopy,
}: OrderPanelProps) {
  const totals = cartTotals(lines);
  const empty = lines.length === 0;

  return (
    <section className="flex max-h-[calc(100vh-6.5rem)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-panel">
      <header className="flex shrink-0 items-start gap-3 border-b border-border p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ClipboardList className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base leading-tight font-semibold tracking-tight">Поточна заявка на ЗІЗ</h2>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Підрозділ: {division} ({holding})
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Очистити заявку"
          title="Очистити заявку"
          disabled={empty}
          onClick={onClear}
        >
          <ListX />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {empty ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <div className="flex size-11 items-center justify-center rounded-md bg-muted">
              <PackageOpen className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Заявка порожня. Додайте позиції з каталогу.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {lines.map((l) => (
              <li key={l.item.code} className="rounded-md border border-accent bg-muted p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <TmcBadge code={l.item.code} className="bg-card" />
                    <span className="truncate text-[11px] text-muted-foreground">{l.item.standard}</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Видалити: ${l.item.name}`}
                    onClick={() => onQty(l.item.code, 0)}
                    className="-mt-0.5 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-1.5 text-xs leading-snug font-semibold">{l.item.name}</div>
                <div className="mt-2.5 flex items-end justify-between gap-2">
                  <QtyStepper
                    value={l.qty}
                    max={l.item.stock}
                    label={l.item.name}
                    onChange={(q) => onQty(l.item.code, q)}
                  />
                  <div className="text-right">
                    <div className="data text-sm font-semibold">{formatMoney(l.sumGross)}</div>
                    <div className="data text-[11px] text-muted-foreground">
                      б/ПДВ: {formatMoney(l.sumNet)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t border-border p-4">
        <dl className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Кількість позицій / одиниць:</dt>
            <dd className="data font-semibold">
              {totals.positions} поз. ({totals.units.toLocaleString("uk-UA")} од.)
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Сума без ПДВ:</dt>
            <dd className="data">{formatMoney(totals.net)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">ПДВ (20%):</dt>
            <dd className="data">{formatMoney(totals.vat)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <dt className="font-display text-sm font-semibold">Разом до сплати:</dt>
            <dd className="data text-xl font-semibold tracking-tight text-primary">
              {formatMoney(totals.gross)}
            </dd>
          </div>
        </dl>

        <Button variant="primary" size="lg" className="mt-4 w-full" disabled={empty} onClick={onExport}>
          <Download /> Вивантажити заявку в Excel (.xlsx)
        </Button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="soft" size="sm" onClick={onPreview}>
            <FileSearch /> Перегляд бланка
          </Button>
          <Button variant="soft" size="sm" disabled={empty} onClick={onCopy}>
            <Copy /> Копіювати текст
          </Button>
        </div>
      </footer>
    </section>
  );
}
