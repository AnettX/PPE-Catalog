import { HardHat, UserRound } from "lucide-react";

export function AppHeader({ holding, division }: { holding: string; division: string }) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 xl:px-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border border-border bg-chip text-primary">
              <HardHat className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="micro text-primary">B2B ЗІЗ портал</div>
              <div className="font-display text-base font-semibold tracking-tight">Каталог ЗІЗ</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              title="Синхронізація з ERP активна"
              className="micro inline-flex h-6 items-center gap-1.5 rounded-sm border border-success-border bg-success-soft px-2 text-success-foreground"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              ERP
            </span>
            <span className="font-display text-xs font-medium text-muted-foreground">{holding}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="micro text-subtle-foreground">Підрозділ-замовник</div>
            <div className="font-display text-sm font-medium">{division}</div>
          </div>
          <button
            type="button"
            aria-label="Профіль користувача"
            className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <UserRound className="size-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
