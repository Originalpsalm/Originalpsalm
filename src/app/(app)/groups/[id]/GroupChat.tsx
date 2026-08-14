"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizonal } from "lucide-react";
import { Avatar, cn } from "@/components/ui";
import type { Message } from "@/lib/types";

const POLL_MS = 5000;

export function GroupChat({
  groupId,
  initialMessages,
  viewerId,
}: {
  groupId: number;
  initialMessages: Message[];
  viewerId: number;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const lastId = messages.length ? messages[messages.length - 1].id : 0;

  // Short-poll for new messages. A websocket would be nicer, but polling keeps
  // the app deployable anywhere and costs a phone almost nothing.
  useEffect(() => {
    let cancelled = false;
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const response = await fetch(`/api/groups/${groupId}/messages?after=${lastId}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as { messages: Message[] };
        if (!cancelled && data.messages.length) {
          setMessages((previous) => {
            const seen = new Set(previous.map((message) => message.id));
            return [...previous, ...data.messages.filter((message) => !seen.has(message.id))];
          });
        }
      } catch {
        /* offline for a moment — the next tick retries */
      }
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [groupId, lastId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = (await response.json()) as { message?: Message; error?: string };
      if (!response.ok || !data.message) {
        setError(data.error ?? "Message did not send. Try again.");
        return;
      }
      setMessages((previous) => [...previous, data.message!]);
      setDraft("");
    } catch {
      setError("You seem to be offline. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card flex h-[min(70dvh,620px)] flex-col">
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-mist">
            No messages yet. Say hello and set the study plan for tonight.
          </p>
        )}

        {messages.map((message, position) => {
          const mine = message.user_id === viewerId;
          const previous = messages[position - 1];
          const grouped = previous?.user_id === message.user_id;

          return (
            <div
              key={message.id}
              className={cn("flex gap-2.5", mine && "flex-row-reverse", grouped && "-mt-2.5")}
            >
              <span className={cn("w-8 shrink-0", grouped && "opacity-0")}>
                {!grouped && (
                  <Avatar name={message.author_name} hue={message.avatar_hue} userId={message.user_id} avatarVersion={message.avatar_version} size={32} />
                )}
              </span>

              <div className={cn("max-w-[78%] min-w-0", mine && "items-end text-right")}>
                {!grouped && (
                  <p className="mb-1 text-xs text-mist">
                    {mine ? "You" : message.author_name}
                    <span className="ml-2 opacity-60">
                      {message.created_at.slice(11, 16)}
                    </span>
                  </p>
                )}
                <p
                  className={cn(
                    "inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-left text-sm leading-relaxed",
                    mine
                      ? "rounded-tr-sm bg-leaf-600/25 text-chalk"
                      : "rounded-tl-sm bg-ink-800/80 text-chalk",
                  )}
                >
                  {message.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="border-t border-leaf-500/10 p-3">
        {error && (
          <p className="mb-2 text-xs text-red-300" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(event);
              }
            }}
            rows={1}
            maxLength={1000}
            placeholder="Ask a question or share how you solved it…"
            aria-label="Message"
            className="max-h-32 flex-1 resize-none rounded-xl border border-leaf-500/15 bg-ink-900/70 px-3.5 py-2.5 text-sm text-chalk placeholder:text-mist/50 focus-ring focus:border-leaf-500/45"
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="focus-ring grid size-11 shrink-0 place-items-center rounded-xl brand-gradient text-brandink transition disabled:opacity-40"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <SendHorizonal size={18} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
