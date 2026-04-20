import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PathStep, ResultStatus } from "@/simulation/types";
import { cn } from "@/lib/utils";
import { Trophy, UserX, ShieldAlert, Clock, RotateCcw } from "lucide-react";

interface SummaryModalProps {
  open: boolean;
  result: ResultStatus | null;
  finalTrust: number;
  path: PathStep[];
  onReset: () => void;
  onExit?: () => void;
}

const RESULT_META: Record<ResultStatus, { title: string; subtitle: string; icon: React.ElementType; tone: string; }> = {
  deal_closed_strong: {
    title: "Deal Closed — Strong Trust",
    subtitle: "Excellent client rapport. The policy was issued with confidence.",
    icon: Trophy,
    tone: "text-trust-high",
  },
  deal_closed_weak: {
    title: "Deal Closed — Fragile Trust",
    subtitle: "Sale completed, but the relationship is shaky. Expect questions.",
    icon: Trophy,
    tone: "text-trust-mid",
  },
  client_walked_away: {
    title: "Client Walked Away",
    subtitle: "Trust collapsed. The client ended the meeting.",
    icon: UserX,
    tone: "text-trust-low",
  },
  compliance_violation: {
    title: "Compliance Violation",
    subtitle: "A statement crossed regulatory limits. This conversation is reportable.",
    icon: ShieldAlert,
    tone: "text-destructive",
  },
  timeout: {
    title: "Client Lost Patience",
    subtitle: "You took too long to respond. The client disengaged.",
    icon: Clock,
    tone: "text-trust-low",
  },
};

export function SummaryModal({ open, result, finalTrust, path, onReset, onExit }: SummaryModalProps) {
  if (!result) return null;
  const meta = RESULT_META[result];
  const Icon = meta.icon;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md [&>button]:hidden">
        <DialogHeader>
          <div className={cn("mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-muted", meta.tone)}>
            <Icon className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-xl">{meta.title}</DialogTitle>
          <DialogDescription className="text-center">{meta.subtitle}</DialogDescription>
        </DialogHeader>

        <div className="my-2 grid grid-cols-2 gap-3">
          <Stat label="Final Trust" value={`${Math.round(finalTrust)} / 100`} />
          <Stat label="Turns Used" value={`${path.length}`} />
        </div>

        <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Decision Path
          </p>
          <ol className="space-y-1.5">
            {path.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 font-mono text-muted-foreground">{i + 1}.</span>
                <span className="flex-1 truncate">{p.selected_option_text}</span>
                <span
                  className={cn(
                    "shrink-0 font-mono font-semibold",
                    p.trust_delta > 0 ? "text-trust-high" : "text-trust-low",
                  )}
                >
                  {p.trust_delta > 0 ? "+" : ""}
                  {p.trust_delta}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Button onClick={onReset} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            Run Scenario Again
          </Button>
          {onExit && (
            <Button onClick={onExit} variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}
