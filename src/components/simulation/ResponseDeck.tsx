import { cn } from "@/lib/utils";
import type { DialogueOption, OptionType } from "@/simulation/types";
import { TURN_SECONDS } from "@/simulation/useSimulation";
import { Heart, BarChart3, Zap, AlertTriangle, Timer } from "lucide-react";

interface ResponseDeckProps {
  options: DialogueOption[];
  onSelect: (index: number) => void;
  secondsLeft: number;
  disabled?: boolean;
}

const TYPE_META: Record<OptionType, { label: string; icon: React.ElementType; bg: string; fg: string; border: string }> = {
  empathetic: {
    label: "Empathetic",
    icon: Heart,
    bg: "bg-opt-empathetic-bg",
    fg: "text-opt-empathetic",
    border: "border-opt-empathetic/30 hover:border-opt-empathetic",
  },
  data: {
    label: "Data-Driven",
    icon: BarChart3,
    bg: "bg-opt-data-bg",
    fg: "text-opt-data",
    border: "border-opt-data/30 hover:border-opt-data",
  },
  hardsell: {
    label: "Hard-Sell",
    icon: Zap,
    bg: "bg-opt-hardsell-bg",
    fg: "text-opt-hardsell",
    border: "border-opt-hardsell/30 hover:border-opt-hardsell",
  },
  compliance: {
    label: "Risky",
    icon: AlertTriangle,
    bg: "bg-opt-compliance-bg",
    fg: "text-opt-compliance",
    border: "border-opt-compliance/30 hover:border-opt-compliance",
  },
};

export function ResponseDeck({ options, onSelect, secondsLeft, disabled }: ResponseDeckProps) {
  const pct = (secondsLeft / TURN_SECONDS) * 100;
  const urgent = secondsLeft <= 8;
  const critical = secondsLeft <= 4;

  return (
    <footer className="sticky bottom-0 z-20 w-full border-t border-border bg-card/95 shadow-deck backdrop-blur-md">
      {/* Timer bar */}
      <div className="mx-auto w-full max-w-2xl px-4 pt-3">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium">
          <span className={cn("flex items-center gap-1", critical ? "text-destructive" : urgent ? "text-trust-low" : "text-muted-foreground")}>
            <Timer className={cn("h-3.5 w-3.5", critical && "animate-pulse")} />
            {Math.ceil(secondsLeft)}s to respond
          </span>
          <span className="text-muted-foreground">Choose your reply</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full transition-[width] duration-100 ease-linear",
              critical ? "bg-destructive" : urgent ? "bg-trust-low" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-2xl gap-2 p-3 sm:grid-cols-2">
        {options.map((opt, i) => {
          const meta = TYPE_META[opt.type];
          const Icon = meta.icon;
          const positive = opt.trust_delta > 0;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              disabled={disabled}
              className={cn(
                "group relative flex flex-col gap-1.5 rounded-2xl border-2 bg-card p-3 text-left transition-all",
                "hover:-translate-y-0.5 hover:shadow-bubble active:translate-y-0 active:scale-[0.99]",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
                meta.border,
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    meta.bg,
                    meta.fg,
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-mono font-semibold opacity-0 transition-opacity group-hover:opacity-100",
                    positive ? "text-trust-high" : "text-trust-low",
                  )}
                >
                  {positive ? "+" : ""}
                  {opt.trust_delta}
                </span>
              </div>
              <p className="text-[14px] leading-snug text-foreground">{opt.text}</p>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
