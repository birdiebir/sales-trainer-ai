import { cn } from "@/lib/utils";
import type { DialogueOption } from "@/simulation/types";
import { TURN_SECONDS } from "@/simulation/useSimulation";
import { Timer } from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";

interface ResponseDeckProps {
  options: DialogueOption[];
  onSelect: (index: number) => void;
  secondsLeft: number;
  disabled?: boolean;
}

/**
 * Bottom dock of 2–4 dialogue choices.
 * - Category labels ("Empathetic", "Data-Driven", etc.) and trust_delta are
 *   intentionally NOT rendered — the agent sees ONLY the dialogue text.
 * - The underlying `type` and `trust_delta` fields on each option are still
 *   consumed downstream (scoring, telemetry) — we just don't expose them.
 */
export function ResponseDeck({ options, onSelect, secondsLeft, disabled }: ResponseDeckProps) {
  const pct = (secondsLeft / TURN_SECONDS) * 100;
  const urgent = secondsLeft <= 8;
  const critical = secondsLeft <= 4;

  // Dynamically clamp to 2–4 options regardless of payload length.
  const visible = options.slice(0, 4);

  return (
    <footer className="sticky bottom-0 z-20 w-full border-t border-border bg-card/95 shadow-deck backdrop-blur-md">
      {/* Timer bar */}
      <div className="mx-auto w-full max-w-2xl px-4 pt-3">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium">
          <span
            className={cn(
              "flex items-center gap-1",
              critical ? "text-destructive" : urgent ? "text-trust-low" : "text-muted-foreground",
            )}
          >
            <Timer className={cn("h-3.5 w-3.5", critical && "animate-pulse")} />
            {Math.ceil(secondsLeft)}s to respond
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            Your reply
            <InfoTooltip
              label="Your reply"
              description="Tap the phrasing you'd actually say to the client. The scenario branches based on your choice — so think about tone and compliance, not just the facts."
            />
          </span>
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

      <div
        className={cn(
          "mx-auto grid w-full max-w-2xl gap-2 p-3",
          // 2 options → single-column on mobile, 2-col on sm+
          // 3-4 options → 2-col on sm+
          visible.length <= 1 ? "grid-cols-1" : "sm:grid-cols-2",
        )}
      >
        {visible.map((opt, i) => (
          <DialogueChoice
            key={i}
            option={opt}
            index={i}
            onSelect={onSelect}
            disabled={disabled}
          />
        ))}
      </div>
    </footer>
  );
}

interface DialogueChoiceProps {
  option: DialogueOption;
  index: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

/**
 * One tappable dialogue card. Deliberately shows only the dialogue text —
 * no category tag, no score hint.
 */
function DialogueChoice({ option, index, onSelect, disabled }: DialogueChoiceProps) {
  return (
    <button
      onClick={() => onSelect(index)}
      disabled={disabled}
      className={cn(
        "group relative flex items-start rounded-2xl border-2 border-border bg-card p-3 text-left transition-all",
        "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-bubble active:translate-y-0 active:scale-[0.99]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
      )}
    >
      <p className="text-[14px] leading-snug text-foreground">{option.text}</p>
    </button>
  );
}
