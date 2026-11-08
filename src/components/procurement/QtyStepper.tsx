import { Minus, Plus } from "lucide-react";

interface QtyStepperProps {
  value: number;
  max: number;
  onChange: (qty: number) => void;
  label: string;
}

export function QtyStepper({ value, max, onChange, label }: QtyStepperProps) {
  return (
    <div className="inline-flex h-8 items-stretch overflow-hidden rounded-sm bg-accent">
      <button
        type="button"
        aria-label={`Зменшити: ${label}`}
        onClick={() => onChange(value - 1)}
        className="flex w-8 items-center justify-center text-accent-foreground transition-colors hover:bg-accent-strong"
      >
        <Minus className="size-3.5" />
      </button>
      <input
        aria-label={`Кількість: ${label}`}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
        onFocus={(e) => e.target.select()}
        className="data w-10 bg-transparent text-center text-sm font-semibold text-accent-foreground outline-none focus:bg-card"
      />
      <button
        type="button"
        aria-label={`Збільшити: ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="flex w-8 items-center justify-center text-accent-foreground transition-colors hover:bg-accent-strong disabled:opacity-40"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
