import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface QtyStepperProps {
  value: number;
  max: number;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
  label: string;
}

export function QtyStepper({ value, max, onChange, size = "md", label }: QtyStepperProps) {
  const h = size === "sm" ? "h-7" : "h-8";
  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-md border border-input bg-card",
        h,
      )}
    >
      <button
        type="button"
        aria-label={`Зменшити: ${label}`}
        onClick={() => onChange(value - 1)}
        className="flex w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Minus className="size-3.5" />
      </button>
      <input
        aria-label={`Кількість: ${label}`}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        onFocus={(e) => e.target.select()}
        className="tabular w-12 border-x border-input bg-transparent text-center text-sm font-medium outline-none focus:bg-brand-soft"
      />
      <button
        type="button"
        aria-label={`Збільшити: ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="flex w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
