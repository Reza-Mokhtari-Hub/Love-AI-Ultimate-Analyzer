import React, { useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Bot,
  Send,
  RotateCcw,
  Copy,
  Check,
  Zap,
  HelpCircle,
  FileText,
} from "lucide-react";
import { chatPresetsList } from "../data/chatPresets";
import { playClickSound, playSuccessSound } from "../utils/audio";

export const ChatForensicsModule: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [stage, setStage] = useState<string>("رابطه جدی / ۶ ماهه");
  const [contextType, setContextType] = useState<string>("پیام متنی / چت");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectPreset = (sample: string, defaultStage: string) => {
    playClickSound();
    setInputText(sample);
    setStage(defaultStage);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!inputText || inputText.trim().length < 10) {
      alert("لطفاً حداقل دو جمله یا متن پیام را وارد کنید.");
      return;
    }

    playClickSound();
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/analyze-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          contextType,
          relationshipStage: stage,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        playSuccessSound();
      } else {
        setAnalysisResult(data.error || "خطا در پردازش تحلیل پیام");
      }
    } catch {
      setAnalysisResult("متاسفانه در برقراری ارتباط با مدل هوش مصنوعی خطایی رخ داد.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!analysisResult) return;
    playClickSound();
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <MessageSquare className="w-4 h-4" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            کالبدشکافی هوشمند چت و سناریوهای مشکوک
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          تحلیل موشکافانه ساب‌تکست‌ها (Subtext)، کشف انگیزه‌های پنهان، تشخیص دستکاری روانی و پیشنهاد پاسخ‌های هوشمندانه توسط Gemini 3.7
        </p>
      </div>

      {/* Preset Chips */}
      <div className="mb-5">
        <span className="text-xs text-slate-400 font-bold mb-2 block flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>سناریوهای پرتکرار واقعی (کلیک برای تست فوری):</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {chatPresetsList.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.sampleText, preset.stage)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition-colors text-right"
            >
              • {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6 shadow-2xl border border-slate-800">
        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              مرحله رابطه:
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
            >
              <option value="هفته‌های اول آشنایی">هفته‌های اول آشنایی</option>
              <option value="رابطه جدی / ۶ ماهه">رابطه جدی / ۶ ماهه</option>
              <option value="رابطه بلندمدت و نامزدی">رابطه بلندمدت و نامزدی</option>
              <option value="پس از مشاجره یا در آستانه جدایی">پس از مشاجره یا در آستانه جدایی</option>
              <option value="ارتباط با پارتنر سابق (Ex)">ارتباط با پارتنر سابق (Ex)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              نوع داده:
            </label>
            <select
              value={contextType}
              onChange={(e) => setContextType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-sky-500"
            >
              <option value="پیام متنی / چت شبکه‌های اجتماعی">پیام متنی / چت شبکه‌های اجتماعی</option>
              <option value="مکالمه حضوری یا تلفنی">شرح یک مکالمه حضوری یا تلفنی</option>
              <option value="رفتار و سکوت مشکوک">شرح یک رفتار مبهم یا سکوت</option>
              <option value="بهانه‌تراشی و تاخیر در پاسخ">بهانه‌تراشی و تاخیر در پاسخ</option>
            </select>
          </div>
        </div>

        {/* Text Area */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
            <span>متن پیام، چت یا شرح اتفاق:</span>
            <span className="text-[11px] text-slate-500">{inputText.length} کاراکتر</span>
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="متن پیام پارتنر یا مکالمه خود را اینجا بنویسید یا کپی کنید..."
            className="w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-sm leading-relaxed placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              setInputText("");
              setAnalysisResult(null);
            }}
            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>پاک کردن</span>
          </button>

          <button
            id="btn-analyze-chat"
            disabled={isLoading || !inputText.trim()}
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-sky-500/25 transition-all"
          >
            {isLoading ? (
              <>
                <Bot className="w-4 h-4 animate-spin" />
                <span>در حال کالبدشکافی زبانی...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>شروع کالبدشکافی پیام</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {analysisResult && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-black text-white">
                نتیجه کالبدشکافی و راهنمای پاسخگویی
              </h2>
            </div>

            <button
              onClick={handleCopyAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "کپی شد" : "کپی تحلیل"}</span>
            </button>
          </div>

          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-loose whitespace-pre-line bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
};
