import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  RotateCcw,
  MessageSquareHeart,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CoachMessage, QuizResult } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface CoachChatModuleProps {
  lastResult?: QuizResult | null;
}

export const CoachChatModule: React.FC<CoachChatModuleProps> = ({ lastResult }) => {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: "msg-0",
      role: "model",
      content: `سلام و درود! من مربی هوشمند و روانشناس بالینی روابط عاطفی شما هستم. 🌸
${
  lastResult
    ? `بر اساس آخرین کارنامه سنجش شما (نمره خلوص: ${lastResult.score}٪ و سبک دلبستگی ${lastResult.dominantAttachmentTitle})، آماده‌ام تا به هر سوال، چالش یا دغدغه‌ای در رابطه پاسخ دهم.`
    : "آماده‌ام تا با روش‌های علمی روانشناسی شناختی (CBT)، مهارت‌های ارتباط بدون خشونت (NVC) و اصول گاتمن در حل چالش‌های عاطفی کنارتان باشم."
}

درباره چه موضوعی می‌خواهید گفتگو کنیم؟`,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    "چطور بدون دعوا دلخوری‌ام را مطرح کنم؟",
    "پادزهر قهر خاموش (Stonewalling) چیست؟",
    "چطور اضطراب رهاشدگی‌ام را کنترل کنم؟",
    "تفاوت عشق واقعی با وابستگی ناسالم چیست؟",
    "چطور خط قرمزها و مرزهایم را تعیین کنم؟",
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    playClickSound();
    const userMsg: CoachMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          userContext: lastResult
            ? {
                score: lastResult.score,
                attachment: lastResult.dominantAttachmentTitle,
                metrics: lastResult.metrics,
                redFlags: lastResult.redFlags,
                greenFlags: lastResult.greenFlags,
              }
            : null,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const botMsg: CoachMessage = {
          id: "bot-" + Date.now(),
          role: "model",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        playSuccessSound();
      } else {
        throw new Error(data.error || "خطا در دریافت پاسخ");
      }
    } catch {
      const errorMsg: CoachMessage = {
        id: "err-" + Date.now(),
        role: "model",
        content: "متاسفانه مشکلی در ارتباط به وجود آمد. لطفاً مجدداً امتحان کنید.",
        timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    playClickSound();
    setMessages([
      {
        id: "msg-0",
        role: "model",
        content: "چت بازنشانی شد. چطور می‌توانم در مسائل عاطفی و رابطه به شما کمک کنم؟",
        timestamp: new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              مربی هوشمند و روانشناس اختصاصی روابط
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            مشاوره محرمانه، تحلیل بحران‌های رابطه و ارائه پروتکل‌های گفتگوی سازنده
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>شروع گفتگوی جدید</span>
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>پرسش‌های پرتکرار و کاربردی:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-indigo-500/20 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-indigo-200 border border-slate-800 transition-all text-right"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-800 flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1 mb-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                      : "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? "bg-rose-500/20 text-white border border-rose-500/30 rounded-tr-none"
                      : "bg-slate-900/90 text-slate-100 border border-slate-800 rounded-tl-none shadow-md"
                  }`}
                >
                  <p>{msg.content}</p>
                  <span
                    className={`text-[9px] block mt-1.5 ${
                      isUser ? "text-rose-300" : "text-slate-500"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-900/90 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>مربی در حال تدوین راهکار تخصصی...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-3 border-t border-slate-800"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="دغدغه یا سوال خود را مطرح کنید..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/25 transition-colors"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
