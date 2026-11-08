import { ClipboardList, Download, Printer, Sheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  cartTotals,
  formatAmount,
  formatDateTime,
  orderFilename,
  specNumber,
  type CartLine,
} from "@/lib/procurement";

interface ExportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: CartLine[];
  division: string;
  createdAt: Date;
  onDownload: () => void;
}

export function ExportPreviewDialog({
  open,
  onOpenChange,
  lines,
  division,
  createdAt,
  onDownload,
}: ExportPreviewDialogProps) {
  const totals = cartTotals(lines);
  const empty = lines.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-print-area className="max-w-4xl gap-0 overflow-hidden rounded-xl border-border-strong bg-card p-0 shadow-pop">
        <div className="flex items-start gap-3 border-b border-border bg-muted px-6 py-4 pr-16">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-success-border bg-success-soft text-success">
            <Sheet className="size-4.5" />
          </div>
          <div>
            <DialogTitle className="text-lg leading-tight font-semibold tracking-tight">
              Зведена відомість потреби ЗІЗ (Експорт)
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              Бланк № {specNumber(createdAt)} | Формат: ДСТУ/EN сумісний
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium">
              <ClipboardList className="size-4 text-primary" />
              Стандартизована специфікація
            </span>
            <span className="data rounded-sm bg-success-strong-soft px-2 py-0.5 text-[11px] font-semibold text-success-foreground">
              {orderFilename(division, createdAt)}
            </span>
          </div>

          <div className="mt-4 max-h-[50vh] overflow-auto rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-accent">
                <tr className="micro text-left whitespace-nowrap text-muted-foreground">
                  <th className="px-3 py-2.5">Код ТМЦ</th>
                  <th className="px-3 py-2.5">Назва товару</th>
                  <th className="px-3 py-2.5 text-center">Кількість</th>
                  <th className="px-3 py-2.5 text-right">Ціна без ПДВ (₴)</th>
                  <th className="px-3 py-2.5 text-right">Сума без ПДВ (₴)</th>
                  <th className="px-3 py-2.5 text-right">Сума з ПДВ (₴)</th>
                </tr>
              </thead>
              <tbody>
                {empty ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted-foreground">
                      Заявка порожня — додайте позиції з каталогу.
                    </td>
                  </tr>
                ) : (
                  lines.map((l) => (
                    <tr key={l.item.code} className="border-t border-chip">
                      <td className="data px-3 py-2.5 font-semibold whitespace-nowrap">{l.item.code}</td>
                      <td className="px-3 py-2.5">{l.item.name}</td>
                      <td className="data px-3 py-2.5 text-center font-semibold">{l.qty}</td>
                      <td className="data px-3 py-2.5 text-right">{formatAmount(l.item.priceNet)}</td>
                      <td className="data px-3 py-2.5 text-right">{formatAmount(l.sumNet)}</td>
                      <td className="data px-3 py-2.5 text-right">{formatAmount(l.sumGross)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {!empty && (
                <tfoot className="bg-accent">
                  <tr className="border-t border-border font-semibold">
                    <td colSpan={2} className="micro px-3 py-3">
                      Разом по специфікації (з ПДВ 20%):
                    </td>
                    <td className="data px-3 py-3 text-center text-primary">{totals.units} од.</td>
                    <td className="data px-3 py-3 text-right text-muted-foreground">—</td>
                    <td className="data px-3 py-3 text-right">{formatAmount(totals.net)} ₴</td>
                    <td className="data px-3 py-3 text-right text-primary">{formatAmount(totals.gross)} ₴</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <p className="data mt-4 text-xs text-muted-foreground">
            {formatDateTime(createdAt)} · Замовник: {division}
          </p>
        </div>

        <div data-print-hide className="flex items-center justify-between gap-3 border-t border-border bg-muted px-6 py-4">
          <Button variant="soft" onClick={() => onOpenChange(false)}>
            Закрити перегляд
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" disabled={empty} onClick={() => window.print()}>
              <Printer /> Друк
            </Button>
            <Button variant="primary" disabled={empty} onClick={onDownload}>
              <Download /> Завантажити файл .xlsx
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
