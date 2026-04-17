import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface TrustBarProps {
  score: number;
  clientName: string;
  avatarSrc: string;
  turnsRemaining: number;
}

function getTrustState(score: number) {
  if (score > 70)
    return {
      label: "Trusting",
      bg: "bg-gradient-trust-high",
      icon: ShieldCheck,
      iconColor: "text-trust-high",
      shake: false,
      pulse: false,
    };
  if (score >= 30)
    return {
      label: "Cautious",
      bg: "bg-gradient-trust-mid",
      icon: Shield,
      iconColor: "text-trust-mid",
      shake: false,
      pulse: false,
    };
  if (score >= 15)
    return {
      label: "Skeptical",
      bg: "bg-gradient-trust-low",
      icon: ShieldAlert,
      iconColor: "text-trust-low",
      shake: false,
      pulse: true,
    };
  return {
    label: "About to leave",
    bg: "bg-gradient-trust-low",
    icon: ShieldAlert,
    iconColor: "text-trust-critical",
    shake: true,
    pulse: true,
  };
}

export function TrustBar({ score, clientName, avatarSrc, turnsRemaining }: TrustBarProps) {
  const trust = getTrustState(score);
  const Icon = trust.icon;
  const width = `${Math.max(4, score)}%`;

  return (
    <header
      className={cn(
        "sticky top-0 z-20 w-full border-b border-border bg-card/95 backdrop-blur-md",
        trust.shake && "animate-shake",
      )}
    >
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <div className="relative">
          <img
            src={avatarSrc}
            alt={clientName}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-border"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-trust-high ring-2 ring-card" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold leading-tight">{clientName}</h1>
              <p className="text-[11px] text-muted-foreground">Turns left · {turnsRemaining}</p>
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                "bg-muted",
                trust.iconColor,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {trust.label} · {Math.round(score)}
            </div>
          </div>

          <div
            className={cn(
              "mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted",
              trust.pulse && "animate-pulse-ring",
            )}
          >
            <div
              className={cn("h-full rounded-full transition-all duration-500 ease-out", trust.bg)}
              style={{ width }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
