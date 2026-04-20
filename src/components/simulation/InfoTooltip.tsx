import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  label: string;
  description: string;
  className?: string;
}

/**
 * Small "(i)" icon that reveals a description on hover/focus.
 * Uses Radix Tooltip under the hood so it auto-flips on screen edges.
 */
export function InfoTooltip({ label, description, className }: InfoTooltipProps) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`About ${label}`}
          className={cn(
            "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            className,
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center" collisionPadding={12} className="max-w-[240px] text-xs leading-relaxed">
        <p className="font-semibold">{label}</p>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
