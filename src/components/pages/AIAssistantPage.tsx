'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Send,
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Sparkles,
  RefreshCw,
  ChevronDown,
  Target,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { authService } from '@/src/services/auth.service';
import ReactMarkdown from 'react-markdown';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface PresetCard {
  icon: React.ElementType;
  label: string;
  prompt: string;
  gradient: string;
  iconColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_CARDS: PresetCard[] = [
  {
    icon: Lightbulb,
    label: 'Budget Smarter',
    prompt: 'Give me practical budgeting tips that work for a Ghanaian salary',
    gradient: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-500',
  },
  {
    icon: TrendingUp,
    label: 'Grow My Savings',
    prompt:
      'What are the best saving strategies to grow my money faster in Ghana?',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    icon: DollarSign,
    label: 'Invest in Ghana',
    prompt:
      'Explain beginner investment options available in Ghana with low risk',
    gradient: 'from-blue-500/20 to-indigo-500/10',
    iconColor: 'text-blue-400',
  },
  {
    icon: Users,
    label: 'Susu Groups',
    prompt:
      'How do susu savings groups work and how can I make the most of mine on SnappX?',
    gradient: 'from-purple-500/20 to-violet-500/10',
    iconColor: 'text-purple-400',
  },
  {
    icon: Target,
    label: 'Hit My Goals',
    prompt:
      'Help me create a realistic savings plan to hit a specific financial goal',
    gradient: 'from-rose-500/20 to-pink-500/10',
    iconColor: 'text-rose-400',
  },
  {
    icon: Sparkles,
    label: 'Quick Wins',
    prompt:
      'What are 5 small financial habits I can start today that will make a big difference?',
    gradient: 'from-yellow-500/20 to-amber-500/10',
    iconColor: 'text-yellow-500',
  },
];

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Akwaaba! 👋 I'm your SnappX financial assistant. Whether you want to crush a savings goal, understand your susu group, or learn how to make your cedis work harder, I've got you. What's on your mind?",
  timestamp: new Date(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Maps error codes/messages from auth.service.ts aiChat() to
 * user-friendly strings shown in the chat UI.
 *
 * Error codes emitted by the updated service:
 *   'auth'        — session expired
 *   'rate_limit'  — backend 429 (30 messages/hour limit) or django-ratelimit
 *   any string    — validation errors, AI service errors, network errors
 */
function mapChatError(error: Error | null): string | null {
  if (!error) return null;

  switch (error.message) {
    case 'auth':
      return 'Your session has expired. Please log in again.';

    case 'rate_limit':
      return 'You have reached the hourly message limit. Please try again in a little while.';

    default:
      // Pass through validation messages from client-side checks
      // (e.g. "Conversation too long", "Message too long")
      // and any other specific error text from the backend.
      if (error.message && error.message !== 'Failed to fetch') {
        return error.message;
      }
      return 'Something went wrong — please try again.';
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-2 h-2 rounded-full bg-amber-400/70 animate-bounce"
          style={{ animationDelay: `${i * 120}ms`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  );
}

function MessageBubble({
  message,
  avatarUrl,
}: {
  message: Message;
  avatarUrl?: string;
}) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: 'bubbleIn 0.25s ease-out' }}
    >
      {/* Avatar */}
      <div
        className={`
          shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden
          ${
            isUser
              ? 'bg-linear-to-br from-slate-600 to-slate-700 text-slate-200'
              : 'bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
          }
        `}
      >
        {isUser && avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="You"
            width={32}
            height={32}
            className="object-cover w-full h-full"
          />
        ) : isUser ? (
          <User size={14} />
        ) : (
          <Bot size={14} />
        )}
      </div>

      {/* Message content */}
      <div
        className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`
            rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${
              isUser
                ? 'bg-amber-500 text-white rounded-br-sm shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-sm backdrop-blur-sm'
            }
            ${
              message.isStreaming && !message.content
                ? ''
                : message.isStreaming
                  ? 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:text-amber-400'
                  : ''
            }
          `}
        >
          {!message.content && message.isStreaming ? (
            <TypingDots />
          ) : isUser ? (
            <span>{message.content}</span>
          ) : (
            <div
              className="prose-sm prose-invert max-w-none
                prose-p:my-1 prose-p:leading-relaxed
                prose-ul:my-1 prose-ul:pl-4
                prose-ol:my-1 prose-ol:pl-4
                prose-li:my-0.5 prose-li:leading-relaxed
                prose-strong:text-amber-300 prose-strong:font-semibold
                prose-headings:text-slate-100 prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1
                prose-code:text-amber-300 prose-code:bg-slate-700/50 prose-code:px-1 prose-code:rounded
                [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            >
              <ReactMarkdown
                components={{
                  ul: ({ children }) => (
                    <ul className="list-disc space-y-1 pl-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal space-y-1 pl-4">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
                    >
                      {children}
                    </a>
                  ),
                  p: ({ children }) => (
                    <p className="leading-relaxed my-1">{children}</p>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-500 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function PresetGrid({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="w-full">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3 px-1">
        Popular topics
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {PRESET_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onSelect(card.prompt)}
              className={`
                group flex flex-col gap-2 p-3.5 rounded-xl
                border border-slate-200 dark:border-slate-700/60
                bg-linear-to-br ${card.gradient}
                hover:border-slate-400 dark:hover:border-slate-500/80
                hover:scale-[1.02] transition-all duration-200 text-left cursor-pointer
              `}
            >
              <Icon
                size={16}
                className={`${card.iconColor} transition-transform group-hover:scale-110`}
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                {card.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScrollAnchor({
  show,
  onClick,
}: {
  show: boolean;
  onClick: () => void;
}) {
  if (!show) return null;
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shadow-lg hover:bg-slate-600 transition-colors z-10"
    >
      <ChevronDown size={14} className="text-slate-300" />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  const showPresets = messages.length === 1;

  // ─── Profile query (reuses cached data) ──────────────────────────────────
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: authService.getProfile,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const avatarUrl = profile?.profile_picture ?? undefined;

  // ─── Scroll helpers ───────────────────────────────────────────────────────

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
  };

  // ─── Mutation ─────────────────────────────────────────────────────────────

  const {
    mutate: sendChat,
    isPending,
    error,
    reset: resetMutation,
  } = useMutation({
    mutationFn: ({
      history,
      onChunk,
      signal,
    }: {
      history: { role: 'user' | 'assistant'; content: string }[];
      onChunk: (text: string) => void;
      signal: AbortSignal;
    }) => authService.aiChat(history, onChunk, signal),

    onError: (err: Error) => {
      if (streamingIdRef.current) {
        const userMessage =
          mapChatError(err) ?? 'Something went wrong. Please try again.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingIdRef.current
              ? { ...m, content: userMessage, isStreaming: false }
              : m,
          ),
        );
      }
    },

    onSettled: () => {
      if (streamingIdRef.current) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingIdRef.current ? { ...m, isStreaming: false } : m,
          ),
        );
        streamingIdRef.current = null;
      }
      inputRef.current?.focus();
    },
  });

  // ─── Send handler ─────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isPending) return;

      resetMutation();
      setInput('');

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      const assistantMsgId = generateId();
      streamingIdRef.current = assistantMsgId;

      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Build history — exclude the static welcome bubble
      const history = [...messages, userMsg]
        .filter((m) => m.id !== 'welcome')
        .map(({ role, content }) => ({ role, content }));

      abortRef.current = new AbortController();

      sendChat({
        history,
        signal: abortRef.current.signal,
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: m.content + chunk }
                : m,
            ),
          );
        },
      });
    },
    [isPending, messages, sendChat, resetMutation],
  );

  const handleReset = () => {
    abortRef.current?.abort();
    resetMutation();
    streamingIdRef.current = null;
    setMessages([
      { ...WELCOME_MESSAGE, id: generateId(), timestamp: new Date() },
    ]);
    inputRef.current?.focus();
  };

  // ─── Derive user-facing error text ────────────────────────────────────────
  const errorText = mapChatError(error as Error | null);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-3xl mx-auto pb-20 md:pb-0">
        {/* Header */}
        <div className="flex items-center justify-between px-1 py-3 mb-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Bot size={18} className="text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-slate-700 dark:text-slate-100 text-base leading-tight">
                SnappX Assistant
              </h1>
              <p className="text-[11px] text-emerald-400 font-medium">
                {isPending ? 'Thinking…' : 'Online • Ready to help'}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            title="New conversation"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Chat area */}
        <div className="flex-1 relative min-h-0">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="absolute inset-0 overflow-y-auto hide-scrollbar px-1 py-2 flex flex-col gap-4"
          >
            {showPresets && (
              <div style={{ animation: 'bubbleIn 0.3s ease-out' }}>
                <PresetGrid onSelect={sendMessage} />
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} avatarUrl={avatarUrl} />
            ))}

            {/* Error banner — shown below messages when a non-streaming error occurs */}
            {errorText && (
              <p className="text-center text-[11px] text-amber-500/70 px-4 py-1 bg-amber-500/5 rounded-full border border-amber-500/20 mx-auto">
                ⚠ {errorText}
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ScrollAnchor show={showScrollBtn} onClick={() => scrollToBottom()} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2
              bg-white dark:bg-slate-800/80
              border border-slate-200 dark:border-slate-700/60
              rounded-2xl px-4 py-2.5 backdrop-blur-sm
              shadow-md shadow-black/10 dark:shadow-black/20"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about budgeting, savings, investing…"
              disabled={isPending}
              className="flex-1 bg-transparent text-sm
                text-slate-800 dark:text-slate-100
                placeholder-slate-400 dark:placeholder-slate-500
                outline-none disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isPending}
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
                ${
                  input.trim() && !isPending
                    ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/30 scale-100'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 scale-95 cursor-not-allowed'
                }
              `}
            >
              {isPending ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-2">
            SnappX AI · Not a substitute for licensed financial advice
          </p>
        </div>
      </div>
    </>
  );
}
