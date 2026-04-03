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

  // ─── Profile query (reuses cached data from ProfilePage) ─────────────────
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
        const isAuth = err.message === 'auth';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingIdRef.current
              ? {
                  ...m,
                  content: isAuth
                    ? 'Your session has expired. Please log in again. 🔒'
                    : "I'm having a little trouble connecting right now. Please try again! 🙏",
                  isStreaming: false,
                }
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

  // ─── Derive user-facing error message ─────────────────────────────────────

  const errorText = error
    ? error.message === 'auth'
      ? 'Session expired — please log in again.'
      : error.message.toLowerCase().includes('rate') ||
          error.message.toLowerCase().includes('too many')
        ? 'AI service is temporarily unavailable — please try again in a few minutes.'
        : 'Something went wrong — please try again.'
    : null;

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

// // src/components/pages/AIAssistantPage.tsx

// 'use client';

// import { useState, useRef, useEffect, useCallback } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import {
//   Send,
//   Bot,
//   User,
//   Lightbulb,
//   TrendingUp,
//   DollarSign,
//   Sparkles,
//   RefreshCw,
//   ChevronDown,
//   Target,
//   Users,
// } from 'lucide-react';
// import { authService } from '@/src/services/auth.service';
// import ReactMarkdown from 'react-markdown';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
//   isStreaming?: boolean;
// }

// interface PresetCard {
//   icon: React.ElementType;
//   label: string;
//   prompt: string;
//   gradient: string;
//   iconColor: string;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const PRESET_CARDS: PresetCard[] = [
//   {
//     icon: Lightbulb,
//     label: 'Budget Smarter',
//     prompt: 'Give me practical budgeting tips that work for a Ghanaian salary',
//     gradient: 'from-amber-500/20 to-orange-500/10',
//     iconColor: 'text-amber-500',
//   },
//   {
//     icon: TrendingUp,
//     label: 'Grow My Savings',
//     prompt:
//       'What are the best saving strategies to grow my money faster in Ghana?',
//     gradient: 'from-emerald-500/20 to-teal-500/10',
//     iconColor: 'text-emerald-500',
//   },
//   {
//     icon: DollarSign,
//     label: 'Invest in Ghana',
//     prompt:
//       'Explain beginner investment options available in Ghana with low risk',
//     gradient: 'from-blue-500/20 to-indigo-500/10',
//     iconColor: 'text-blue-400',
//   },
//   {
//     icon: Users,
//     label: 'Susu Groups',
//     prompt:
//       'How do susu savings groups work and how can I make the most of mine on SnappX?',
//     gradient: 'from-purple-500/20 to-violet-500/10',
//     iconColor: 'text-purple-400',
//   },
//   {
//     icon: Target,
//     label: 'Hit My Goals',
//     prompt:
//       'Help me create a realistic savings plan to hit a specific financial goal',
//     gradient: 'from-rose-500/20 to-pink-500/10',
//     iconColor: 'text-rose-400',
//   },
//   {
//     icon: Sparkles,
//     label: 'Quick Wins',
//     prompt:
//       'What are 5 small financial habits I can start today that will make a big difference?',
//     gradient: 'from-yellow-500/20 to-amber-500/10',
//     iconColor: 'text-yellow-500',
//   },
// ];

// const WELCOME_MESSAGE: Message = {
//   id: 'welcome',
//   role: 'assistant',
//   content:
//     "Akwaaba! 👋 I'm your SnappX financial assistant. Whether you want to crush a savings goal, understand your susu group, or learn how to make your cedis work harder, I've got you. What's on your mind?",
//   timestamp: new Date(),
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const formatTime = (date: Date) =>
//   date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function TypingDots() {
//   return (
//     <div className="flex items-center gap-1 py-1">
//       {[0, 1, 2].map((i) => (
//         <span
//           key={i}
//           className="block w-2 h-2 rounded-full bg-amber-400/70 animate-bounce"
//           style={{ animationDelay: `${i * 120}ms`, animationDuration: '0.9s' }}
//         />
//       ))}
//     </div>
//   );
// }

// function MessageBubble({ message }: { message: Message }) {
//   const isUser = message.role === 'user';

//   return (
//     <div
//       className={`flex gap-3 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
//       style={{ animation: 'bubbleIn 0.25s ease-out' }}
//     >
//       {/* Avatar */}
//       <div
//         className={`
//           shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
//           ${
//             isUser
//               ? 'bg-linear-to-br from-slate-600 to-slate-700 text-slate-200'
//               : 'bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
//           }
//         `}
//       >
//         {isUser ? <User size={14} /> : <Bot size={14} />}
//       </div>

//       {/* Message content */}
//       <div
//         className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
//       >
//         <div
//           className={`
//             rounded-2xl px-4 py-3 text-sm leading-relaxed
//             ${
//               isUser
//                 ? 'bg-amber-500 text-white rounded-br-sm shadow-md shadow-amber-500/20'
//                 : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-sm backdrop-blur-sm'
//             }
//             ${
//               message.isStreaming && !message.content
//                 ? ''
//                 : message.isStreaming
//                   ? 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:text-amber-400'
//                   : ''
//             }
//           `}
//         >
//           {!message.content && message.isStreaming ? (
//             <TypingDots />
//           ) : isUser ? (
//             <span>{message.content}</span>
//           ) : (
//             <div
//               className="prose-sm prose-invert max-w-none
//                 prose-p:my-1 prose-p:leading-relaxed
//                 prose-ul:my-1 prose-ul:pl-4
//                 prose-ol:my-1 prose-ol:pl-4
//                 prose-li:my-0.5 prose-li:leading-relaxed
//                 prose-strong:text-amber-300 prose-strong:font-semibold
//                 prose-headings:text-slate-100 prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1
//                 prose-code:text-amber-300 prose-code:bg-slate-700/50 prose-code:px-1 prose-code:rounded
//                 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
//             >
//               <ReactMarkdown
//                 components={{
//                   ul: ({ children }) => (
//                     <ul className="list-disc space-y-1 pl-4">{children}</ul>
//                   ),
//                   ol: ({ children }) => (
//                     <ol className="list-decimal space-y-1 pl-4">{children}</ol>
//                   ),
//                   li: ({ children }) => (
//                     <li className="leading-relaxed">{children}</li>
//                   ),
//                   // ✅ FIXED: Proper <a> element
//                   a: ({ href, children }) => (
//                     <a
//                       href={href}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
//                     >
//                       {children}
//                     </a>
//                   ),
//                   p: ({ children }) => (
//                     <p className="leading-relaxed my-1">{children}</p>
//                   ),
//                 }}
//               >
//                 {message.content}
//               </ReactMarkdown>
//             </div>
//           )}
//         </div>

//         <span className="text-[10px] text-slate-500 px-1">
//           {formatTime(message.timestamp)}
//         </span>
//       </div>
//     </div>
//   );
// }

// function PresetGrid({ onSelect }: { onSelect: (prompt: string) => void }) {
//   return (
//     <div className="w-full">
//       <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3 px-1">
//         Popular topics
//       </p>
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//         {PRESET_CARDS.map((card) => {
//           const Icon = card.icon;
//           return (
//             <button
//               key={card.label}
//               onClick={() => onSelect(card.prompt)}
//               className={`
//                 group flex flex-col gap-2 p-3.5 rounded-xl
//                 border border-slate-200 dark:border-slate-700/60
//                 bg-linear-to-br ${card.gradient}
//                 hover:border-slate-400 dark:hover:border-slate-500/80
//                 hover:scale-[1.02] transition-all duration-200 text-left cursor-pointer
//               `}
//             >
//               <Icon
//                 size={16}
//                 className={`${card.iconColor} transition-transform group-hover:scale-110`}
//               />
//               <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
//                 {card.label}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function ScrollAnchor({
//   show,
//   onClick,
// }: {
//   show: boolean;
//   onClick: () => void;
// }) {
//   if (!show) return null;
//   return (
//     <button
//       onClick={onClick}
//       className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shadow-lg hover:bg-slate-600 transition-colors z-10"
//     >
//       <ChevronDown size={14} className="text-slate-300" />
//     </button>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function AIAssistantPage() {
//   const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
//   const [input, setInput] = useState('');
//   const [showScrollBtn, setShowScrollBtn] = useState(false);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const abortRef = useRef<AbortController | null>(null);
//   // Track the streaming assistant message id so the onChunk callback
//   // can update the correct message even after re-renders.
//   const streamingIdRef = useRef<string | null>(null);

//   const showPresets = messages.length === 1;

//   const scrollToBottom = useCallback((smooth = true) => {
//     messagesEndRef.current?.scrollIntoView({
//       behavior: smooth ? 'smooth' : 'instant',
//     });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   const handleScroll = () => {
//     const el = scrollContainerRef.current;
//     if (!el) return;
//     setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
//   };

//   // ─── Mutation ───────────────────────────────────────────────────────────────

//   const {
//     mutate: sendChat,
//     isPending,
//     error,
//     reset: resetMutation,
//   } = useMutation({
//     mutationFn: ({
//       history,
//       onChunk,
//       signal,
//     }: {
//       history: { role: 'user' | 'assistant'; content: string }[];
//       onChunk: (text: string) => void;
//       signal: AbortSignal;
//     }) => authService.aiChat(history, onChunk, signal),

//     onError: (err: Error) => {
//       // Mark the placeholder as done streaming regardless of error type
//       if (streamingIdRef.current) {
//         const isAuth = err.message === 'auth';
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === streamingIdRef.current
//               ? {
//                   ...m,
//                   content: isAuth
//                     ? 'Your session has expired. Please log in again. 🔒'
//                     : "I'm having a little trouble connecting right now. Please try again! 🙏",
//                   isStreaming: false,
//                 }
//               : m,
//           ),
//         );
//       }
//     },

//     onSettled: () => {
//       // Always stop streaming state and refocus input
//       if (streamingIdRef.current) {
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === streamingIdRef.current ? { ...m, isStreaming: false } : m,
//           ),
//         );
//         streamingIdRef.current = null;
//       }
//       inputRef.current?.focus();
//     },
//   });

//   // ─── Send handler ────────────────────────────────────────────────────────────

//   const sendMessage = useCallback(
//     (text: string) => {
//       const trimmed = text.trim();
//       if (!trimmed || isPending) return;

//       resetMutation();
//       setInput('');

//       const userMsg: Message = {
//         id: generateId(),
//         role: 'user',
//         content: trimmed,
//         timestamp: new Date(),
//       };

//       const assistantMsgId = generateId();
//       streamingIdRef.current = assistantMsgId;

//       const assistantMsg: Message = {
//         id: assistantMsgId,
//         role: 'assistant',
//         content: '',
//         timestamp: new Date(),
//         isStreaming: true,
//       };

//       setMessages((prev) => [...prev, userMsg, assistantMsg]);

//       // Build history — exclude the static welcome bubble
//       const history = [...messages, userMsg]
//         .filter((m) => m.id !== 'welcome')
//         .map(({ role, content }) => ({ role, content }));

//       abortRef.current = new AbortController();

//       sendChat({
//         history,
//         signal: abortRef.current.signal,
//         onChunk: (chunk) => {
//           setMessages((prev) =>
//             prev.map((m) =>
//               m.id === assistantMsgId
//                 ? { ...m, content: m.content + chunk }
//                 : m,
//             ),
//           );
//         },
//       });
//     },
//     [isPending, messages, sendChat, resetMutation],
//   );

//   const handleReset = () => {
//     abortRef.current?.abort();
//     resetMutation();
//     streamingIdRef.current = null;
//     setMessages([
//       { ...WELCOME_MESSAGE, id: generateId(), timestamp: new Date() },
//     ]);
//     inputRef.current?.focus();
//   };

//   // ─── Derive user-facing error message ────────────────────────────────────────

//   const errorText = error
//     ? error.message === 'auth'
//       ? 'Session expired — please log in again.'
//       : error.message.toLowerCase().includes('rate') ||
//           error.message.toLowerCase().includes('too many')
//         ? 'AI service is temporarily unavailable — please try again in a few minutes.'
//         : 'Something went wrong — please try again.'
//     : null;

//   // ─── Render ──────────────────────────────────────────────────────────────────

//   return (
//     <>
//       <style>{`
//         @keyframes bubbleIn {
//           from { opacity: 0; transform: translateY(8px) scale(0.97); }
//           to   { opacity: 1; transform: translateY(0)  scale(1); }
//         }
//         .hide-scrollbar::-webkit-scrollbar { display: none; }
//         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>

//       <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-3xl mx-auto pb-20 md:pb-0">
//         {/* Header */}
//         <div className="flex items-center justify-between px-1 py-3 mb-2 shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
//                 <Bot size={18} className="text-white" />
//               </div>
//               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
//             </div>
//             <div>
//               <h1 className="font-bold text-slate-700 dark:text-slate-100 text-base leading-tight">
//                 SnappX Assistant
//               </h1>
//               <p className="text-[11px] text-emerald-400 font-medium">
//                 {isPending ? 'Thinking…' : 'Online • Ready to help'}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={handleReset}
//             title="New conversation"
//             className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
//           >
//             <RefreshCw size={14} />
//           </button>
//         </div>

//         {/* Chat area */}
//         <div className="flex-1 relative min-h-0">
//           <div
//             ref={scrollContainerRef}
//             onScroll={handleScroll}
//             className="absolute inset-0 overflow-y-auto hide-scrollbar px-1 py-2 flex flex-col gap-4"
//           >
//             {showPresets && (
//               <div style={{ animation: 'bubbleIn 0.3s ease-out' }}>
//                 <PresetGrid onSelect={sendMessage} />
//               </div>
//             )}

//             {messages.map((msg) => (
//               <MessageBubble key={msg.id} message={msg} />
//             ))}

//             {errorText && (
//               <p className="text-center text-[11px] text-amber-500/70 px-4 py-1 bg-amber-500/5 rounded-full border border-amber-500/20 mx-auto">
//                 ⚠ {errorText}
//               </p>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           <ScrollAnchor show={showScrollBtn} onClick={() => scrollToBottom()} />
//         </div>

//         {/* Input bar */}
//         <div className="shrink-0 pt-3">
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               sendMessage(input);
//             }}
//             className="flex items-center gap-2
//       bg-white dark:bg-slate-800/80
//       border border-slate-200 dark:border-slate-700/60
//       rounded-2xl px-4 py-2.5 backdrop-blur-sm
//       shadow-md shadow-black/10 dark:shadow-black/20"
//           >
//             <input
//               ref={inputRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Ask about budgeting, savings, investing…"
//               disabled={isPending}
//               className="flex-1 bg-transparent text-sm
//         text-slate-800 dark:text-slate-100
//         placeholder-slate-400 dark:placeholder-slate-500
//         outline-none disabled:opacity-50"
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter' && !e.shiftKey) {
//                   e.preventDefault();
//                   sendMessage(input);
//                 }
//               }}
//             />
//             <button
//               type="submit"
//               disabled={!input.trim() || isPending}
//               className={`
//         w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
//         ${
//           input.trim() && !isPending
//             ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/30 scale-100'
//             : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 scale-95 cursor-not-allowed'
//         }
//       `}
//             >
//               {isPending ? (
//                 <RefreshCw size={14} className="animate-spin" />
//               ) : (
//                 <Send size={14} />
//               )}
//             </button>
//           </form>
//           <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 mt-2">
//             SnappX AI · Not a substitute for licensed financial advice
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }

// // src/components/pages/AIAssistantPage.tsx

// 'use client';

// import { useState, useRef, useEffect, useCallback } from 'react';
// import {
//   Send,
//   Bot,
//   User,
//   Lightbulb,
//   TrendingUp,
//   DollarSign,
//   Sparkles,
//   RefreshCw,
//   ChevronDown,
//   Target,
//   Users,
// } from 'lucide-react';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
//   isStreaming?: boolean;
// }

// interface PresetCard {
//   icon: React.ElementType;
//   label: string;
//   prompt: string;
//   gradient: string;
//   iconColor: string;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const PRESET_CARDS: PresetCard[] = [
//   {
//     icon: Lightbulb,
//     label: 'Budget Smarter',
//     prompt: 'Give me practical budgeting tips that work for a Ghanaian salary',
//     gradient: 'from-amber-500/20 to-orange-500/10',
//     iconColor: 'text-amber-500',
//   },
//   {
//     icon: TrendingUp,
//     label: 'Grow My Savings',
//     prompt:
//       'What are the best saving strategies to grow my money faster in Ghana?',
//     gradient: 'from-emerald-500/20 to-teal-500/10',
//     iconColor: 'text-emerald-500',
//   },
//   {
//     icon: DollarSign,
//     label: 'Invest in Ghana',
//     prompt:
//       'Explain beginner investment options available in Ghana with low risk',
//     gradient: 'from-blue-500/20 to-indigo-500/10',
//     iconColor: 'text-blue-400',
//   },
//   {
//     icon: Users,
//     label: 'Susu Groups',
//     prompt:
//       'How do susu savings groups work and how can I make the most of mine on SnappX?',
//     gradient: 'from-purple-500/20 to-violet-500/10',
//     iconColor: 'text-purple-400',
//   },
//   {
//     icon: Target,
//     label: 'Hit My Goals',
//     prompt:
//       'Help me create a realistic savings plan to hit a specific financial goal',
//     gradient: 'from-rose-500/20 to-pink-500/10',
//     iconColor: 'text-rose-400',
//   },
//   {
//     icon: Sparkles,
//     label: 'Quick Wins',
//     prompt:
//       'What are 5 small financial habits I can start today that will make a big difference?',
//     gradient: 'from-yellow-500/20 to-amber-500/10',
//     iconColor: 'text-yellow-500',
//   },
// ];

// const WELCOME_MESSAGE: Message = {
//   id: 'welcome',
//   role: 'assistant',
//   content:
//     "Akwaaba! 👋 I'm your SnappX financial assistant. Whether you want to crush a savings goal, understand your susu group, or learn how to make your cedis work harder — I've got you. What's on your mind?",
//   timestamp: new Date(),
// };

// // Change this to match wherever your Django API lives
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const formatTime = (date: Date) =>
//   date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// /** Retrieve the JWT access token however your app stores it */
// function getAccessToken(): string | null {
//   // Adjust this to match your auth setup (localStorage, cookie, context, etc.)
//   return localStorage.getItem('access_token');
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function TypingDots() {
//   return (
//     <div className="flex items-center gap-1 py-1">
//       {[0, 1, 2].map((i) => (
//         <span
//           key={i}
//           className="block w-2 h-2 rounded-full bg-amber-400/70 animate-bounce"
//           style={{ animationDelay: `${i * 120}ms`, animationDuration: '0.9s' }}
//         />
//       ))}
//     </div>
//   );
// }

// function MessageBubble({ message }: { message: Message }) {
//   const isUser = message.role === 'user';

//   return (
//     <div
//       className={`flex gap-3 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
//       style={{ animation: 'bubbleIn 0.25s ease-out' }}
//     >
//       <div
//         className={`
//           shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
//           ${
//             isUser
//               ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200'
//               : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
//           }
//         `}
//       >
//         {isUser ? <User size={14} /> : <Bot size={14} />}
//       </div>

//       <div
//         className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
//       >
//         <div
//           className={`
//             rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
//             ${
//               isUser
//                 ? 'bg-amber-500 text-white rounded-br-sm shadow-md shadow-amber-500/20'
//                 : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-sm backdrop-blur-sm'
//             }
//             ${
//               message.isStreaming
//                 ? 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:text-amber-400'
//                 : ''
//             }
//           `}
//         >
//           {message.content || <TypingDots />}
//         </div>
//         <span className="text-[10px] text-slate-500 px-1">
//           {formatTime(message.timestamp)}
//         </span>
//       </div>
//     </div>
//   );
// }

// function PresetGrid({ onSelect }: { onSelect: (prompt: string) => void }) {
//   return (
//     <div className="w-full">
//       <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3 px-1">
//         Popular topics
//       </p>
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//         {PRESET_CARDS.map((card) => {
//           const Icon = card.icon;
//           return (
//             <button
//               key={card.label}
//               onClick={() => onSelect(card.prompt)}
//               className={`
//                 group flex flex-col gap-2 p-3.5 rounded-xl border border-slate-700/60
//                 bg-gradient-to-br ${card.gradient}
//                 hover:border-slate-500/80 hover:scale-[1.02]
//                 transition-all duration-200 text-left cursor-pointer
//               `}
//             >
//               <Icon
//                 size={16}
//                 className={`${card.iconColor} transition-transform group-hover:scale-110`}
//               />
//               <span className="text-xs font-semibold text-slate-200 leading-tight">
//                 {card.label}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function ScrollAnchor({
//   show,
//   onClick,
// }: {
//   show: boolean;
//   onClick: () => void;
// }) {
//   if (!show) return null;
//   return (
//     <button
//       onClick={onClick}
//       className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shadow-lg hover:bg-slate-600 transition-colors z-10"
//     >
//       <ChevronDown size={14} className="text-slate-300" />
//     </button>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function AIAssistantPage() {
//   const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showScrollBtn, setShowScrollBtn] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const abortRef = useRef<AbortController | null>(null);

//   const showPresets = messages.length === 1;

//   const scrollToBottom = useCallback((smooth = true) => {
//     messagesEndRef.current?.scrollIntoView({
//       behavior: smooth ? 'smooth' : 'instant',
//     });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   const handleScroll = () => {
//     const el = scrollContainerRef.current;
//     if (!el) return;
//     const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
//     setShowScrollBtn(distFromBottom > 120);
//   };

//   const sendMessage = useCallback(
//     async (text: string) => {
//       const trimmed = text.trim();
//       if (!trimmed || isLoading) return;

//       setError(null);
//       setInput('');

//       const userMsg: Message = {
//         id: generateId(),
//         role: 'user',
//         content: trimmed,
//         timestamp: new Date(),
//       };

//       const assistantMsgId = generateId();
//       const assistantMsg: Message = {
//         id: assistantMsgId,
//         role: 'assistant',
//         content: '',
//         timestamp: new Date(),
//         isStreaming: true,
//       };

//       setMessages((prev) => [...prev, userMsg, assistantMsg]);
//       setIsLoading(true);

//       // Build history — exclude the static welcome bubble, send only real turns
//       const history = [...messages, userMsg]
//         .filter((m) => m.id !== 'welcome')
//         .map(({ role, content }) => ({ role, content }));

//       abortRef.current = new AbortController();

//       try {
//         const token = getAccessToken();
//         const response = await fetch(`${API_BASE_URL}/api/accounts/ai/chat/`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//           signal: abortRef.current.signal,
//           body: JSON.stringify({ messages: history }),
//         });

//         if (response.status === 401) throw new Error('auth');
//         if (!response.ok) throw new Error(`http_${response.status}`);

//         const reader = response.body!.getReader();
//         const decoder = new TextDecoder();
//         let accumulated = '';

//         while (true) {
//           const { done, value } = await reader.read();
//           if (done) break;

//           const chunk = decoder.decode(value, { stream: true });
//           const lines = chunk.split('\n');

//           for (const line of lines) {
//             if (!line.startsWith('data: ')) continue;
//             const data = line.slice(6).trim();

//             if (data === '[DONE]') break;

//             if (data.startsWith('[ERROR]')) {
//               setError(
//                 data.replace('[ERROR]', '').trim() ||
//                   'Something went wrong. Please try again.',
//               );
//               accumulated =
//                 "I'm having a little trouble right now. Please try again in a moment! 🙏";
//               break;
//             }

//             // Unescape newlines that were escaped on the server
//             accumulated += data.replace(/\\n/g, '\n');

//             setMessages((prev) =>
//               prev.map((m) =>
//                 m.id === assistantMsgId ? { ...m, content: accumulated } : m,
//               ),
//             );
//           }
//         }

//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
//           ),
//         );
//       } catch (err: unknown) {
//         if ((err as Error).name === 'AbortError') return;

//         const userFacingError =
//           (err as Error).message === 'auth'
//             ? 'Your session has expired. Please log in again.'
//             : 'Connection issue — please check your internet and try again.';

//         setError(userFacingError);
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === assistantMsgId
//               ? {
//                   ...m,
//                   content:
//                     "I'm having a little trouble connecting right now. Please try again! 🙏",
//                   isStreaming: false,
//                 }
//               : m,
//           ),
//         );
//       } finally {
//         setIsLoading(false);
//         inputRef.current?.focus();
//       }
//     },
//     [isLoading, messages],
//   );

//   const handleReset = () => {
//     abortRef.current?.abort();
//     setMessages([
//       { ...WELCOME_MESSAGE, id: generateId(), timestamp: new Date() },
//     ]);
//     setIsLoading(false);
//     setError(null);
//     inputRef.current?.focus();
//   };

//   return (
//     <>
//       <style>{`
//         @keyframes bubbleIn {
//           from { opacity: 0; transform: translateY(8px) scale(0.97); }
//           to   { opacity: 1; transform: translateY(0)  scale(1); }
//         }
//         .hide-scrollbar::-webkit-scrollbar { display: none; }
//         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>

//       <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-3xl mx-auto pb-20 md:pb-0">
//         {/* Header */}
//         <div className="flex items-center justify-between px-1 py-3 mb-2 shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
//                 <Bot size={18} className="text-white" />
//               </div>
//               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
//             </div>
//             <div>
//               <h1 className="font-bold text-slate-100 text-base leading-tight">
//                 SnappX Assistant
//               </h1>
//               <p className="text-[11px] text-emerald-400 font-medium">
//                 Online • Ready to help
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={handleReset}
//             title="New conversation"
//             className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
//           >
//             <RefreshCw size={14} />
//           </button>
//         </div>

//         {/* Chat area */}
//         <div className="flex-1 relative min-h-0">
//           <div
//             ref={scrollContainerRef}
//             onScroll={handleScroll}
//             className="absolute inset-0 overflow-y-auto hide-scrollbar px-1 py-2 flex flex-col gap-4"
//           >
//             {showPresets && (
//               <div style={{ animation: 'bubbleIn 0.3s ease-out' }}>
//                 <PresetGrid onSelect={(prompt) => sendMessage(prompt)} />
//               </div>
//             )}

//             {messages.map((msg) => (
//               <MessageBubble key={msg.id} message={msg} />
//             ))}

//             {error && (
//               <p className="text-center text-[11px] text-amber-500/70 px-4 py-1 bg-amber-500/5 rounded-full border border-amber-500/20 mx-auto">
//                 ⚠ {error}
//               </p>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           <ScrollAnchor show={showScrollBtn} onClick={() => scrollToBottom()} />
//         </div>

//         {/* Input bar */}
//         <div className="shrink-0 pt-3">
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               sendMessage(input);
//             }}
//             className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2.5 backdrop-blur-sm shadow-xl shadow-black/20"
//           >
//             <input
//               ref={inputRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Ask about budgeting, savings, investing…"
//               disabled={isLoading}
//               className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none disabled:opacity-50"
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter' && !e.shiftKey) {
//                   e.preventDefault();
//                   sendMessage(input);
//                 }
//               }}
//             />
//             <button
//               type="submit"
//               disabled={!input.trim() || isLoading}
//               className={`
//                 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
//                 ${
//                   input.trim() && !isLoading
//                     ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/30 scale-100'
//                     : 'bg-slate-700 text-slate-500 scale-95 cursor-not-allowed'
//                 }
//               `}
//             >
//               {isLoading ? (
//                 <RefreshCw size={14} className="animate-spin" />
//               ) : (
//                 <Send size={14} />
//               )}
//             </button>
//           </form>
//           <p className="text-center text-[10px] text-slate-600 mt-2">
//             SnappX AI · Not a substitute for licensed financial advice
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }

// 'use client';

// import { useState, useRef, useEffect, useCallback } from 'react';
// import {
//   Send,
//   Bot,
//   User,
//   Lightbulb,
//   TrendingUp,
//   DollarSign,
//   Sparkles,
//   RefreshCw,
//   ChevronDown,
//   Target,
//   Users,
// } from 'lucide-react';

// // ─── Types ──────────────────────────────────────────────────────────────────

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
//   isStreaming?: boolean;
// }

// interface PresetCard {
//   icon: React.ElementType;
//   label: string;
//   prompt: string;
//   gradient: string;
//   iconColor: string;
// }

// // ─── Constants ───────────────────────────────────────────────────────────────

// const SYSTEM_PROMPT = `You are SnappX AI — a warm, sharp financial assistant built for everyday Ghanaians.
// SnappX is a susu/savings app where users create group savings circles, set personal goals, and contribute regularly.

// Your personality:
// - Friendly and encouraging, like a knowledgeable older sibling
// - Concrete and practical — always give actionable steps
// - Use Ghanaian context: mention cedis (₵), MoMo, susu groups, chop money, etc. naturally
// - Keep responses concise (3-5 bullet points or short paragraphs max) unless asked for detail
// - End with a question or next step to keep conversation flowing

// You help with:
// - Budgeting and expense tracking
// - Savings strategies (personal goals and group susu)
// - Investment basics (treasury bills, fixed deposits, stocks)
// - How to use SnappX features (groups, goals, payouts)
// - General financial literacy for the Ghanaian context

// Never give specific investment advice or guarantees. Always recommend consulting a licensed financial advisor for complex decisions.`;

// const PRESET_CARDS: PresetCard[] = [
//   {
//     icon: Lightbulb,
//     label: 'Budget Smarter',
//     prompt: 'Give me practical budgeting tips that work for a Ghanaian salary',
//     gradient: 'from-amber-500/20 to-orange-500/10',
//     iconColor: 'text-amber-500',
//   },
//   {
//     icon: TrendingUp,
//     label: 'Grow My Savings',
//     prompt:
//       'What are the best saving strategies to grow my money faster in Ghana?',
//     gradient: 'from-emerald-500/20 to-teal-500/10',
//     iconColor: 'text-emerald-500',
//   },
//   {
//     icon: DollarSign,
//     label: 'Invest in Ghana',
//     prompt:
//       'Explain beginner investment options available in Ghana with low risk',
//     gradient: 'from-blue-500/20 to-indigo-500/10',
//     iconColor: 'text-blue-400',
//   },
//   {
//     icon: Users,
//     label: 'Susu Groups',
//     prompt:
//       'How do susu savings groups work and how can I make the most of mine on SnappX?',
//     gradient: 'from-purple-500/20 to-violet-500/10',
//     iconColor: 'text-purple-400',
//   },
//   {
//     icon: Target,
//     label: 'Hit My Goals',
//     prompt:
//       'Help me create a realistic savings plan to hit a specific financial goal',
//     gradient: 'from-rose-500/20 to-pink-500/10',
//     iconColor: 'text-rose-400',
//   },
//   {
//     icon: Sparkles,
//     label: 'Quick Wins',
//     prompt:
//       'What are 5 small financial habits I can start today that will make a big difference?',
//     gradient: 'from-yellow-500/20 to-amber-500/10',
//     iconColor: 'text-yellow-500',
//   },
// ];

// const WELCOME_MESSAGE: Message = {
//   id: 'welcome',
//   role: 'assistant',
//   content:
//     "Akwaaba! 👋 I'm your SnappX financial assistant. Whether you want to crush a savings goal, understand your susu group, or learn how to make your cedis work harder — I've got you. What's on your mind?",
//   timestamp: new Date(),
// };

// // ─── Helpers ─────────────────────────────────────────────────────────────────

// const formatTime = (date: Date) =>
//   date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// // ─── Sub-components ──────────────────────────────────────────────────────────

// function TypingDots() {
//   return (
//     <div className="flex items-center gap-1 py-1">
//       {[0, 1, 2].map((i) => (
//         <span
//           key={i}
//           className="block w-2 h-2 rounded-full bg-amber-400/70 animate-bounce"
//           style={{ animationDelay: `${i * 120}ms`, animationDuration: '0.9s' }}
//         />
//       ))}
//     </div>
//   );
// }

// function MessageBubble({ message }: { message: Message }) {
//   const isUser = message.role === 'user';

//   return (
//     <div
//       className={`flex gap-3 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
//       style={{ animation: 'bubbleIn 0.25s ease-out' }}
//     >
//       {/* Avatar */}
//       <div
//         className={`
//           shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
//           ${
//             isUser
//               ? 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200'
//               : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
//           }
//         `}
//       >
//         {isUser ? <User size={14} /> : <Bot size={14} />}
//       </div>

//       {/* Bubble */}
//       <div
//         className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
//       >
//         <div
//           className={`
//             rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
//             ${
//               isUser
//                 ? 'bg-amber-500 text-white rounded-br-sm shadow-md shadow-amber-500/20'
//                 : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-bl-sm backdrop-blur-sm'
//             }
//             ${message.isStreaming ? 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:text-amber-400' : ''}
//           `}
//         >
//           {message.content || <TypingDots />}
//         </div>
//         <span className="text-[10px] text-slate-500 px-1">
//           {formatTime(message.timestamp)}
//         </span>
//       </div>
//     </div>
//   );
// }

// function PresetGrid({ onSelect }: { onSelect: (prompt: string) => void }) {
//   return (
//     <div className="w-full">
//       <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-3 px-1">
//         Popular topics
//       </p>
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//         {PRESET_CARDS.map((card) => {
//           const Icon = card.icon;
//           return (
//             <button
//               key={card.label}
//               onClick={() => onSelect(card.prompt)}
//               className={`
//                 group flex flex-col gap-2 p-3.5 rounded-xl border border-slate-700/60
//                 bg-gradient-to-br ${card.gradient}
//                 hover:border-slate-500/80 hover:scale-[1.02]
//                 transition-all duration-200 text-left cursor-pointer
//               `}
//             >
//               <Icon
//                 size={16}
//                 className={`${card.iconColor} transition-transform group-hover:scale-110`}
//               />
//               <span className="text-xs font-semibold text-slate-200 leading-tight">
//                 {card.label}
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function ScrollAnchor({
//   show,
//   onClick,
// }: {
//   show: boolean;
//   onClick: () => void;
// }) {
//   if (!show) return null;
//   return (
//     <button
//       onClick={onClick}
//       className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shadow-lg hover:bg-slate-600 transition-colors z-10"
//     >
//       <ChevronDown size={14} className="text-slate-300" />
//     </button>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function AIAssistantPage() {
//   const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showScrollBtn, setShowScrollBtn] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const abortRef = useRef<AbortController | null>(null);

//   const showPresets = messages.length === 1;

//   // ── Scroll helpers ──
//   const scrollToBottom = useCallback((smooth = true) => {
//     messagesEndRef.current?.scrollIntoView({
//       behavior: smooth ? 'smooth' : 'instant',
//     });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   const handleScroll = () => {
//     const el = scrollContainerRef.current;
//     if (!el) return;
//     const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
//     setShowScrollBtn(distFromBottom > 120);
//   };

//   // ── Send message ──
//   const sendMessage = useCallback(
//     async (text: string) => {
//       const trimmed = text.trim();
//       if (!trimmed || isLoading) return;

//       setError(null);
//       setInput('');

//       const userMsg: Message = {
//         id: generateId(),
//         role: 'user',
//         content: trimmed,
//         timestamp: new Date(),
//       };

//       const assistantMsgId = generateId();
//       const assistantMsg: Message = {
//         id: assistantMsgId,
//         role: 'assistant',
//         content: '',
//         timestamp: new Date(),
//         isStreaming: true,
//       };

//       setMessages((prev) => [...prev, userMsg, assistantMsg]);
//       setIsLoading(true);

//       // Build conversation history for API
//       const history = [...messages, userMsg].map((m) => ({
//         role: m.role,
//         content: m.content,
//       }));

//       abortRef.current = new AbortController();

//       try {
//         const response = await fetch('https://api.anthropic.com/v1/messages', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           signal: abortRef.current.signal,
//           body: JSON.stringify({
//             model: 'claude-sonnet-4-20250514',
//             max_tokens: 1000,
//             system: SYSTEM_PROMPT,
//             stream: true,
//             messages: history,
//           }),
//         });

//         if (!response.ok) {
//           throw new Error(`API error: ${response.status}`);
//         }

//         const reader = response.body!.getReader();
//         const decoder = new TextDecoder();
//         let accumulated = '';

//         // eslint-disable-next-line no-constant-condition
//         while (true) {
//           const { done, value } = await reader.read();
//           if (done) break;

//           const chunk = decoder.decode(value, { stream: true });
//           const lines = chunk.split('\n');

//           for (const line of lines) {
//             if (!line.startsWith('data: ')) continue;
//             const data = line.slice(6).trim();
//             if (data === '[DONE]') continue;

//             try {
//               const parsed = JSON.parse(data);
//               if (
//                 parsed.type === 'content_block_delta' &&
//                 parsed.delta?.type === 'text_delta'
//               ) {
//                 accumulated += parsed.delta.text;
//                 setMessages((prev) =>
//                   prev.map((m) =>
//                     m.id === assistantMsgId
//                       ? { ...m, content: accumulated }
//                       : m,
//                   ),
//                 );
//               }
//             } catch {
//               // skip malformed chunks
//             }
//           }
//         }

//         // Mark streaming done
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
//           ),
//         );
//       } catch (err: unknown) {
//         if ((err as Error).name === 'AbortError') return;

//         // Fallback response on error
//         const fallback =
//           "I'm having a little trouble connecting right now. Please check your internet and try again — I'm here when you're ready! 🙏";
//         setMessages((prev) =>
//           prev.map((m) =>
//             m.id === assistantMsgId
//               ? { ...m, content: fallback, isStreaming: false }
//               : m,
//           ),
//         );
//         setError('Connection issue. Response may be limited.');
//       } finally {
//         setIsLoading(false);
//         inputRef.current?.focus();
//       }
//     },
//     [isLoading, messages],
//   );

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     sendMessage(input);
//   };

//   const handleReset = () => {
//     abortRef.current?.abort();
//     setMessages([
//       { ...WELCOME_MESSAGE, id: generateId(), timestamp: new Date() },
//     ]);
//     setIsLoading(false);
//     setError(null);
//     inputRef.current?.focus();
//   };

//   return (
//     <>
//       {/* Injected styles */}
//       <style>{`
//         @keyframes bubbleIn {
//           from { opacity: 0; transform: translateY(8px) scale(0.97); }
//           to   { opacity: 1; transform: translateY(0)  scale(1); }
//         }
//         .hide-scrollbar::-webkit-scrollbar { display: none; }
//         .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>

//       <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-3xl mx-auto pb-20 md:pb-0">
//         {/* ── Header ── */}
//         <div className="flex items-center justify-between px-1 py-3 mb-2 shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
//                 <Bot size={18} className="text-white" />
//               </div>
//               <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
//             </div>
//             <div>
//               <h1 className="font-bold text-slate-100 text-base leading-tight">
//                 SnappX Assistant
//               </h1>
//               <p className="text-[11px] text-emerald-400 font-medium">
//                 Online • Ready to help
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={handleReset}
//             title="New conversation"
//             className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
//           >
//             <RefreshCw size={14} />
//           </button>
//         </div>

//         {/* ── Chat area ── */}
//         <div className="flex-1 relative min-h-0">
//           <div
//             ref={scrollContainerRef}
//             onScroll={handleScroll}
//             className="absolute inset-0 overflow-y-auto hide-scrollbar px-1 py-2 flex flex-col gap-4"
//           >
//             {/* Presets */}
//             {showPresets && (
//               <div style={{ animation: 'bubbleIn 0.3s ease-out' }}>
//                 <PresetGrid onSelect={(prompt) => sendMessage(prompt)} />
//               </div>
//             )}

//             {/* Messages */}
//             {messages.map((msg) => (
//               <MessageBubble key={msg.id} message={msg} />
//             ))}

//             {/* Error notice */}
//             {error && (
//               <p className="text-center text-[11px] text-amber-500/70 px-4 py-1 bg-amber-500/5 rounded-full border border-amber-500/20 mx-auto">
//                 ⚠ {error}
//               </p>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* Scroll-to-bottom */}
//           <ScrollAnchor show={showScrollBtn} onClick={() => scrollToBottom()} />
//         </div>

//         {/* ── Input bar ── */}
//         <div className="shrink-0 pt-3">
//           <form
//             onSubmit={handleSubmit}
//             className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2.5 backdrop-blur-sm shadow-xl shadow-black/20"
//           >
//             <input
//               ref={inputRef}
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder="Ask about budgeting, savings, investing…"
//               disabled={isLoading}
//               className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none disabled:opacity-50"
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter' && !e.shiftKey) {
//                   e.preventDefault();
//                   sendMessage(input);
//                 }
//               }}
//             />

//             <button
//               type="submit"
//               disabled={!input.trim() || isLoading}
//               className={`
//                 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
//                 ${
//                   input.trim() && !isLoading
//                     ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/30 scale-100'
//                     : 'bg-slate-700 text-slate-500 scale-95 cursor-not-allowed'
//                 }
//               `}
//             >
//               {isLoading ? (
//                 <RefreshCw size={14} className="animate-spin" />
//               ) : (
//                 <Send size={14} />
//               )}
//             </button>
//           </form>

//           <p className="text-center text-[10px] text-slate-600 mt-2">
//             SnappX AI · Not a substitute for licensed financial advice
//           </p>
//         </div>
//       </div>
//     </>
//   );
// }

// // src/components/pages/AIAssistantPage.tsx

// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import {
//   Send,
//   Bot,
//   User,
//   Lightbulb,
//   TrendingUp,
//   DollarSign,
// } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { cn } from '../ui/utils';

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
// }

// const presetQuestions = [
//   {
//     icon: Lightbulb,
//     text: 'Budgeting Tips',
//     variant: 'amber',
//   },
//   {
//     icon: TrendingUp,
//     text: 'Saving Advice',
//     variant: 'emerald',
//   },
//   {
//     icon: DollarSign,
//     text: 'Investment 101',
//     variant: 'rose',
//   },
// ];

// const aiResponses: Record<string, string> = {
//   'budgeting tips':
//     'Here are some budgeting tips for you:\n\n1. Follow the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings\n2. Track every expense for at least a month to understand your spending patterns\n3. Use mobile money statements to monitor your transactions\n4. Set up automatic transfers to your savings on payday\n5. Review and adjust your budget monthly\n\nWould you like help setting up a personalized budget?',
//   'saving advice':
//     'Great savings strategies:\n\n1. Start small - even ₵10/day adds up to ₵3,650/year\n2. Join a susu group for accountability and discipline\n3. Save windfalls (bonuses, gifts) immediately\n4. Use the 24-hour rule before making purchases over ₵100\n5. Set specific goals with deadlines\n6. Automate your savings\n\nYour current savings rate is excellent! Keep it up!',
//   'investment 101':
//     "Investment basics for beginners:\n\n1. Emergency fund first - save 3-6 months of expenses\n2. Understand risk vs reward\n3. Start with low-risk options: treasury bills, fixed deposits\n4. Diversify - don't put all eggs in one basket\n5. Think long-term (5+ years)\n6. Only invest money you can afford to lose\n\nWould you like to explore investment options available in Ghana?",
// };

// export function AIAssistantPage() {
//   const [messages, setMessages] = useState<Message[]>(() => [
//     {
//       id: '1',
//       role: 'assistant',
//       content:
//         "Hello! I'm your SnappX AI Financial Assistant. I'm here to help you with budgeting, saving strategies, and financial advice. How can I assist you today?",
//       timestamp: new Date(),
//     },
//   ]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const createMessage = (
//     role: 'user' | 'assistant',
//     content: string,
//   ): Message => ({
//     id: new Date().getTime().toString(),
//     role,
//     content,
//     timestamp: new Date(),
//   });

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSendMessage = async (messageText?: string) => {
//     const text = messageText || inputMessage;
//     if (!text.trim()) return;

//     const userMessage = createMessage('user', text);
//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage('');
//     setIsTyping(true);

//     await new Promise((resolve) => setTimeout(resolve, 1500));

//     let aiResponse = '';
//     const lowerText = text.toLowerCase();

//     if (lowerText.includes('budget')) {
//       aiResponse = aiResponses['budgeting tips'];
//     } else if (lowerText.includes('sav')) {
//       aiResponse = aiResponses['saving advice'];
//     } else if (lowerText.includes('invest')) {
//       aiResponse = aiResponses['investment 101'];
//     } else if (lowerText.includes('goal') || lowerText.includes('target')) {
//       aiResponse =
//         "Setting financial goals is crucial! Here's what I recommend:\n\n1. Make goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)\n2. Break large goals into smaller milestones\n3. Use our Goals feature to track progress\n4. Celebrate small wins along the way\n5. Review and adjust goals quarterly\n\nWhat goal would you like to set?";
//     } else if (lowerText.includes('group') || lowerText.includes('susu')) {
//       aiResponse =
//         "Savings groups (susu) are powerful! Benefits:\n\n1. Built-in accountability from group members\n2. Rotating payouts help with large expenses\n3. Social support and motivation\n4. Learn from others' financial strategies\n5. Access to group loans in emergencies\n\nTip: Choose groups with members you trust and similar financial goals.";
//     } else {
//       aiResponse = `I understand you're asking about "${text}". I can help you with:\n\n• Budgeting strategies\n• Saving tips and tricks\n• Investment basics\n• Setting financial goals\n• Managing susu groups\n\nPlease ask me anything specific about these topics!`;
//     }

//     const assistantMessage = createMessage('assistant', aiResponse);
//     setMessages((prev) => [...prev, assistantMessage]);
//     setIsTyping(false);
//   };

//   const handlePresetQuestion = (question: string) => {
//     handleSendMessage(question);
//   };

//   // Map variant names to theme-aware classes
//   const getPresetStyle = (variant: string) => {
//     switch (variant) {
//       case 'amber':
//         return {
//           icon: 'text-amber-600 dark:text-amber-400',
//           bg: 'bg-amber-100 dark:bg-amber-950/30 hover:bg-amber-200 dark:hover:bg-amber-900/40',
//           border: 'border-amber-300/50 dark:border-amber-700/50',
//         };
//       case 'emerald':
//         return {
//           icon: 'text-emerald-600 dark:text-emerald-400',
//           bg: 'bg-emerald-100 dark:bg-emerald-950/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/40',
//           border: 'border-emerald-300/50 dark:border-emerald-700/50',
//         };
//       case 'rose':
//         return {
//           icon: 'text-rose-600 dark:text-rose-400',
//           bg: 'bg-rose-100 dark:bg-rose-950/30 hover:bg-rose-200 dark:hover:bg-rose-900/40',
//           border: 'border-rose-300/50 dark:border-rose-700/50',
//         };
//       default:
//         return {
//           icon: 'text-primary',
//           bg: 'bg-primary/10 hover:bg-primary/20',
//           border: 'border-primary/30',
//         };
//     }
//   };

//   return (
//     <div className="h-[calc(100vh-12rem)] flex flex-col space-y-4 mb-20 md:mb-0">
//       {/* Header */}
//       <Card className="bg-card border-border">
//         <CardHeader className="pb-4">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-sm">
//               <Bot className="h-6 w-6 text-primary-foreground" />
//             </div>
//             <div>
//               <CardTitle>AI Financial Assistant</CardTitle>
//               <p className="text-sm text-muted-foreground">
//                 Get personalized financial advice
//               </p>
//             </div>
//           </div>
//         </CardHeader>
//       </Card>

//       {/* Preset Questions */}
//       {messages.length <= 1 && (
//         <div className="space-y-3">
//           <p className="text-sm text-muted-foreground">Quick topics:</p>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//             {presetQuestions.map((preset, index) => {
//               const Icon = preset.icon;
//               const style = getPresetStyle(preset.variant);
//               return (
//                 <button
//                   key={index}
//                   onClick={() => handlePresetQuestion(preset.text)}
//                   className={cn(
//                     'flex items-center gap-3 p-4 rounded-xl border transition-all',
//                     style.border,
//                     style.bg,
//                   )}
//                 >
//                   <Icon className={cn('h-5 w-5', style.icon)} />
//                   <span className="font-medium">{preset.text}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Chat Area */}
//       <Card className="flex-1 flex flex-col overflow-hidden bg-card border-border">
//         <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={cn(
//                 'flex gap-3',
//                 message.role === 'user' ? 'justify-end' : 'justify-start',
//               )}
//             >
//               {message.role === 'assistant' && (
//                 <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary via-primary/80 to-accent flex items-center justify-center shrink-0 shadow-sm">
//                   <Bot className="h-4 w-4 text-primary-foreground" />
//                 </div>
//               )}

//               <div
//                 className={cn(
//                   'max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3',
//                   message.role === 'user'
//                     ? 'bg-primary text-primary-foreground'
//                     : 'bg-muted text-foreground',
//                 )}
//               >
//                 <p className="whitespace-pre-wrap leading-relaxed">
//                   {message.content}
//                 </p>
//                 <p
//                   className={cn(
//                     'text-xs mt-2 opacity-70',
//                     message.role === 'user'
//                       ? 'text-primary-foreground/70'
//                       : 'text-muted-foreground',
//                   )}
//                 >
//                   {message.timestamp.toLocaleTimeString([], {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })}
//                 </p>
//               </div>

//               {message.role === 'user' && (
//                 <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
//                   <User className="h-4 w-4 text-muted-foreground" />
//                 </div>
//               )}
//             </div>
//           ))}

//           {isTyping && (
//             <div className="flex gap-3 justify-start">
//               <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary via-primary/80 to-accent flex items-center justify-center shrink-0">
//                 <Bot className="h-4 w-4 text-primary-foreground" />
//               </div>
//               <div className="bg-muted rounded-2xl px-4 py-3">
//                 <div className="flex gap-1.5">
//                   <div
//                     className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
//                     style={{ animationDelay: '0ms' }}
//                   />
//                   <div
//                     className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
//                     style={{ animationDelay: '150ms' }}
//                   />
//                   <div
//                     className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
//                     style={{ animationDelay: '300ms' }}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={messagesEndRef} />
//         </CardContent>

//         {/* Input Area */}
//         <div className="border-t border-border p-4">
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleSendMessage();
//             }}
//             className="flex gap-2"
//           >
//             <Input
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               placeholder="Ask me anything about budgeting, saving, or investing..."
//               className="flex-1 bg-background"
//               disabled={isTyping}
//             />
//             <Button
//               type="submit"
//               size="icon"
//               className="bg-primary hover:bg-primary/90 text-primary-foreground"
//               disabled={!inputMessage.trim() || isTyping}
//             >
//               <Send className="h-5 w-5" />
//             </Button>
//           </form>
//         </div>
//       </Card>
//     </div>
//   );
// }
