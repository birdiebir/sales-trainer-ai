import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/simulation/useSimulation";
import { useEffect, useRef } from "react";

interface ChatLogProps {
  messages: ChatMessage[];
  avatarSrc: string;
  clientName: string;
}

export function ChatLog({ messages, avatarSrc, clientName }: ChatLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-4">
      <div className="space-y-3">
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showAvatar = m.side === "client" && (!prev || prev.side !== "client");
          return (
            <MessageBubble
              key={m.id}
              message={m}
              avatarSrc={avatarSrc}
              clientName={clientName}
              showAvatar={showAvatar}
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
}

function MessageBubble({ message, avatarSrc, clientName, showAvatar }: BubbleProps) {
  const isClient = message.side === "client";

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2 animate-bubble-in",
        isClient ? "justify-start" : "justify-end",
      )}
    >
      {isClient && (
        <div className="w-8 shrink-0">
          {showAvatar && (
            <img
              src={avatarSrc}
              alt={clientName}
              width={32}
              height={32}
              loading="lazy"
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
        </div>
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
    </div>
  );
}
