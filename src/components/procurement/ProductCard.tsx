import { CircleCheck, Minus, Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LOW_STOCK_THRESHOLD, formatMoney, priceWithVat, type CatalogItem } from "@/lib/procurement";
import { cn } from "@/lib/utils";

import { StockBadge, TmcBadge } from "./badges";
import { PRODUCT_IMAGES } from "./product-images";

interface ProductCardProps {
  item: CatalogItem;
  qty: number;
  onQty: (qty: number) => void;
}

export function ProductCard({ item, qty, onQty }: ProductCardProps) {
  const out = item.stock === 0;
  const low = !out && item.stock < LOW_STOCK_THRESHOLD;

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border bg-card p-3 transition-colors",
        qty > 0 ? "border-primary/40" : "border-border hover:border-border-strong",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <TmcBadge code={item.code} />
        <span className="micro truncate text-muted-foreground">{item.supplier}</span>
      </div>

      <div className="relative mt-2.5 aspect-[5/4] overflow-hidden rounded-md bg-muted">
        <img
          src={PRODUCT_IMAGES[item.code]}
          alt={item.name}
          loading="lazy"
          width={912}
          height={736}
          className={cn("h-full w-full object-cover", out && "opacity-60 grayscale")}
        />
        <StockBadge stock={item.stock} className="absolute top-2 right-2" />
        <span className="micro absolute bottom-2 left-2 inline-flex h-5 items-center rounded-sm border border-border bg-card/90 px-1.5 text-chip-foreground">
          {item.standard}
        </span>
      </div>

      <h3 className="mt-3 text-sm leading-snug font-semibold">{item.name}</h3>
      <p className="mt-1 line-clamp-3 text-xs leading-[1.125rem] text-muted-foreground">
        {item.description}
      </p>

      <div className="mt-auto pt-3">
        <div className="flex items-start justify-between gap-2 border-t border-border pt-3">
          <div className="min-w-0">
            <div className="data text-base leading-tight font-semibold">
              {formatMoney(item.priceNet)}
              <span className="ml-1 font-sans text-[10px] font-normal text-muted-foreground">
                без ПДВ
              </span>
            </div>
            <div className="data mt-0.5 text-xs text-muted-foreground">
              {formatMoney(priceWithVat(item.priceNet))} з ПДВ
            </div>
          </div>
          <div
            className={cn(
              "shrink-0 text-right text-[11px] leading-tight",
              out ? "text-destructive" : low ? "text-warning" : "text-success",
            )}
          >
            Залишок:
            <div className="data font-semibold">
              {item.stock.toLocaleString("uk-UA")} {item.unit}
            </div>
          </div>
        </div>

        <div className="mt-3">
          {qty > 0 ? (
            <div className="flex h-9 items-center justify-between gap-2 rounded-sm border border-accent-strong bg-accent pr-1 pl-2.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
                <CircleCheck className="size-3.5 text-success" />
                В заявці: <span className="data font-semibold">{qty} {item.unit}</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label={`Зменшити: ${item.name}`}
                  onClick={() => onQty(qty - 1)}
                  className="flex size-7 items-center justify-center rounded-sm border border-border bg-card text-accent-foreground transition-colors hover:border-border-strong"
                >
                  <Minus className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Збільшити: ${item.name}`}
                  disabled={qty >= item.stock}
                  onClick={() => onQty(qty + 1)}
                  className="flex size-7 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-40"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <Button variant="soft" className="w-full" disabled={out} onClick={() => onQty(1)}>
              <ShoppingCart /> {out ? "Немає на складі" : "Додати в заявку"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
