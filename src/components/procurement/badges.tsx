import { LOW_STOCK_THRESHOLD } from "@/lib/procurement";
import { cn } from "@/lib/utils";

export function TmcBadge({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn(
        "data inline-flex h-5 items-center rounded-sm border border-border bg-chip px-1.5 text-[11px] font-semibold text-chip-foreground",
        className,
      )}
    >
      {code}
    </span>
  );
}

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  const state = stock === 0 ? "out" : stock < LOW_STOCK_THRESHOLD ? "low" : "ok";
  return (
    <span
      className={cn(
        "micro inline-flex h-5 items-center rounded-sm px-1.5",
        state === "ok" && "bg-success-strong-soft text-success-foreground",
        state === "low" && "bg-warning-soft text-warning",
        state === "out" && "bg-destructive text-destructive-foreground",
        className,
      )}
    >
      {state === "ok" ? "В наявності" : state === "low" ? "Закінчується" : "Немає"}
    </span>
  );
}
