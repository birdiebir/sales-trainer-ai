import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/simulation/useSimulation";
import { useEffect, useRef } from "react";

interface ChatLogProps {
  messages: ChatMessage[];
  avatarSrc: string;
  clientName: string;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDateDivider(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (sameDay) return "Today";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ChatLog({ messages, avatarSrc, clientName }: ChatLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const firstTs = messages[0]?.timestamp ?? Date.now();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-4">
      {/* LINE-style date divider */}
      <div className="mb-3 flex items-center justify-center">
        <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {formatDateDivider(firstTs)}
        </span>
      </div>

      <div className="space-y-1">
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];

          const showAvatar = m.side === "client" && (!prev || prev.side !== "client");
          // Show timestamp only on the last message of a run from the same sender
          // within a close time window — matches LINE behaviour.
          const showTimestamp =
            !next ||
            next.side !== m.side ||
            next.timestamp - m.timestamp > 60_000;

          return (
            <MessageBubble
              key={m.id}
              message={m}
              avatarSrc={avatarSrc}
              clientName={clientName}
              showAvatar={showAvatar}
              showTimestamp={showTimestamp}
              timeLabel={formatTime(m.timestamp)}
            />
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}

interface BubbleProps {
  message: ChatMessage;
  avatarSrc: string;
  clientName: string;
  showAvatar: boolean;
  showTimestamp: boolean;
  timeLabel: string;
}

function MessageBubble({
  message,
  avatarSrc,
  clientName,
  showAvatar,
  showTimestamp,
  timeLabel,
}: BubbleProps) {
  const isClient = message.side === "client";

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2 py-0.5 animate-bubble-in",
        isClient ? "justify-start" : "justify-end",
      )}
    >
      {isClient && (
        <div className="w-8 shrink-0 self-end">
          {showAvatar ? (
            <img
              src={avatarSrc}
              alt={clientName}
              width={32}
              height={32}
              loading="lazy"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8" aria-hidden />
          )}
        </div>
      )}

      {/* For agent: timestamp sits on the LEFT of the bubble.
          For client: timestamp sits on the RIGHT of the bubble.
          This matches LINE's layout. */}
      {!isClient && showTimestamp && (
        <span className="mb-1 shrink-0 text-[10px] text-muted-foreground">
          {timeLabel}
        </span>
      )}

      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug shadow-bubble",
          isClient
            ? "rounded-bl-sm bg-bubble-client text-bubble-client-foreground"
            : "rounded-br-sm bg-bubble-agent text-bubble-agent-foreground",
        )}
      >
        {message.text}
      </div>

      {isClient && showTimestamp && (
        <span className="mb-1 shrink-0 text-[10px] text-muted-foreground">
          {timeLabel}
        </span>
      )}
    </div>
  );
}
