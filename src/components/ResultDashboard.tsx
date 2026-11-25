import React, { useState } from "react";
import {
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Heart,
  Bot,
  Copy,
  Check,
  Award,
  BarChart3,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  HeartHandshake,
  Gamepad2,
  Compass,
  Brain,
} from "lucide-react";
import { QuizResult } from "../types";
import { RadarChartCanvas } from "./RadarChartCanvas";
import { generatePassportCardImage } from "../utils/canvasExport";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface ResultDashboardProps {
  result: QuizResult;
  onRetake: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  result,
  onRetake,
  onNavigateToTab,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showAllReport, setShowAllReport] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Score color classes
  const getScoreTheme = (s: number) => {
    if (s >= 80)
      return {
        text: "text-emerald-400",
        border: "border-emerald-500/40",
        bg: "bg-emerald-500/10",
        badge: "خلوص عالی و بلوغ عاطفی بسیار بالا",
        ring: "#10b981",
      };
    if (s >= 60)
      return {
        text: "text-sky-400",
        border: "border-sky-500/40",
        bg: "bg-sky-500/10",
        badge: "رابطه نسبتاً سالم با ظرفیت رشد و ترمیم",
        ring: "#38bdf8",
      };
    if (s >= 40)
      return {
        text: "text-amber-400",
        border: "border-amber-500/40",
        bg: "bg-amber-500/10",
        badge: "نیازمند گفتگوی جدی، مرزبندی و بازبینی الگوها",
        ring: "#f59e0b",
      };
    return {
      text: "text-rose-400",
      border: "border-rose-500/40",
      bg: "bg-rose-500/10",
      badge: "وجود الگوهای سمی جدی و ریسک آسیب روانی",
      ring: "#f43f5e",
    };
  };

  const theme = getScoreTheme(result.score);

  const toggleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (result.aiReport) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(result.aiReport.replace(/[*#_`]/g, ""));
      utterance.lang = "fa-IR";
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyReport = () => {
    playClickSound();
    const markdown = `📊 گزارش سنجش خلوص و رفتارشناسی عاطفی (Love AI Analyzer v5.0 Pro)
──────────────────────────────
🎯 نمره شاخص خلوص: ${result.score}٪ (${theme.badge})
🧬 سبک دلبستگی: ${result.dominantAttachmentTitle}
⚖️ ارزیابی واقع‌بینی: ${result.realismStatus}

📊 ابعاد ۶گانه:
• همدلی و درک عاطفی: ${result.metrics.empathy}٪
• تعهد عملی و ثبات: ${result.metrics.commitment}٪
• صداقت و شفافیت: ${result.metrics.trust}٪
• بلوغ عاطفی و خودتنظیمی: ${result.metrics.maturity}٪
• مدیریت خشم و حل تعارض: ${result.metrics.conflict}٪
• حریم شخصی و استقلال: ${result.metrics.boundaries}٪

✅ پرچم‌های سبز: ${result.greenFlags.join(" | ") || "پایداری عمومی"}
⚠️ هشدارهای رفتاری: ${result.redFlags.join(" | ") || "مورد حادی ثبت نشد"}

📝 تحلیل تخصصی هوش مصنوعی:
${result.aiReport}
`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCard = async () => {
    playClickSound();
    setIsExporting(true);
    try {
      const dataUrl = await generatePassportCardImage(result);
      const link = document.createElement("a");
      link.download = `LoveAI-Passport-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      playSuccessSound();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Top Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6 shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Score Circle & Title */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
            <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-slate-900/90 border-4 border-slate-800 shadow-inner">
              <svg className="w-36 h-36 -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke={theme.ring}
                  strokeWidth="8"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * result.score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${theme.text}`}>
                  {result.score}٪
                </span>
                <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                  شاخص خلوص
                </span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 border bg-slate-900/90 border-slate-700 text-slate-200">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>شناسنامه اصالت رابطه • نسخه {result.mode === "full" ? "جامع" : "سریع"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                نتیجه تحلیل لایه‌ای رفتارشناسی
              </h1>
              <p className={`text-sm font-semibold ${theme.text}`}>
                {theme.badge}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3 justify-center sm:justify-start">
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  تاریخ: {result.date}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/30">
                  {result.realismStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 w-full lg:w-auto">
            <button
              id="btn-download-card"
              onClick={handleDownloadCard}
              disabled={isExporting}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? "در حال تولید تصویر..." : "دانلود کارت شناسنامه (PNG)"}</span>
            </button>

            <button
              id="btn-copy-report"
              onClick={handleCopyReport}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "گزارش کپی شد!" : "کپی متن گزارش"}</span>
            </button>

            <button
              id="btn-retake-quiz"
              onClick={() => {
                playClickSound();
                onRetake();
              }}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>انجام مجدد آزمون</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 6-Dimension Radar Chart & Attachment Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Radar Chart Card */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 shadow-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-rose-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                رادار ۶بعدی ابعاد روانشناختی
              </h2>
            </div>
            <span className="text-xs text-slate-400">توزیع همگن ابعاد</span>
          </div>

          <RadarChartCanvas metrics={result.metrics} size={320} />

          {/* Metric Details Linear Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800">
            {[
              { label: "همدلی و درک عاطفی", val: result.metrics.empathy, color: "bg-rose-500" },
              { label: "تعهد عملی و ثبات", val: result.metrics.commitment, color: "bg-sky-500" },
              { label: "صداقت و اعتماد متقابل", val: result.metrics.trust, color: "bg-emerald-500" },
              { label: "بلوغ عاطفی و خودتنظیمی", val: result.metrics.maturity, color: "bg-purple-500" },
              { label: "مدیریت خشم و حل تعارض", val: result.metrics.conflict, color: "bg-amber-500" },
              { label: "حریم شخصی و استقلال", val: result.metrics.boundaries, color: "bg-pink-500" },
            ].map((m, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">{m.label}</span>
                  <span className="font-bold text-white">{m.val}٪</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color}`} style={{ width: `${m.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attachment Style & Flags Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Attachment Style */}
          <div className="glass-card rounded-2xl p-6 shadow-xl border border-slate-800 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <GitBranch className="w-4 h-4 text-sky-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                سبک دلبستگی غالب
              </h2>
            </div>
            <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 mb-3 font-bold text-sm">
              {result.dominantAttachmentTitle}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
              {result.dominantAttachment === "secure" &&
                "شما و رابطه شما دارای بنیاد امن، توانایی برقراری ارتباط صریح، عدم هراس از صمیمیت و مرزهای احترام‌آمیز هستید."}
              {result.dominantAttachment === "anxious" &&
                "الگوهای وابستگی، نیاز مداوم به اطمینان‌بخشی و ترس ناخودآگاه از طرد شدن در برخی سناریوها دیده می‌شود که با تقویت خودارزشمندی بهبود می‌یابد."}
              {result.dominantAttachment === "avoidant" &&
                "تمایل به فاصله‌گذاری هیجانی در زمان تعارض و احساس خفگی از صمیمیت عمیق در رفتارها مشهود است."}
              {result.dominantAttachment === "disorganized" &&
                "نوسان میان تمایل شدید به نزدیکی و فرار ناگهانی به دلیل تجربیات حل‌نشده قبلی نیازمند التیام و امنیت‌سازی است."}
            </p>

            <button
              onClick={() => {
                playClickSound();
                onNavigateToTab("attachment");
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>ورود به قطب‌نمای دقیق دلبستگی دوبعدی (ECR)</span>
            </button>
          </div>

          {/* Green & Red Flags Summary */}
          <div className="glass-card rounded-2xl p-6 shadow-xl border border-slate-800">
            <h2 className="text-base font-extrabold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>پرچم‌های شاخص شناسایی‌شده</span>
            </h2>

            <div className="space-y-3">
              {/* Green Flags */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>نقاط قوت اصیل (Green Flags):</span>
                </div>
                <div className="space-y-1">
                  {result.greenFlags.length > 0 ? (
                    result.greenFlags.slice(0, 3).map((f, i) => (
                      <p key={i} className="text-xs text-slate-300 leading-relaxed">
                        • {f}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">• ثبات عمومی در پاسخ‌ها ثبت شد.</p>
                  )}
                </div>
              </div>

              {/* Red Flags */}
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>هشدارهای رفتاری (Red Flags):</span>
                </div>
                <div className="space-y-1">
                  {result.redFlags.length > 0 ? (
                    result.redFlags.slice(0, 3).map((f, i) => (
                      <p key={i} className="text-xs text-rose-200 leading-relaxed">
                        ⚠️ {f}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-400">• هیچ پرچم قرمز حادی در این آزمون ثبت نشد.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Clinical Analysis Report Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6 shadow-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                گزارش کالبدشکافی هوشمند روانشناختی (Gemini 3.7)
              </h2>
              <p className="text-xs text-slate-400">
                تحلیل جامع مبتنی بر رویکرد تحلیلی-شناختی (CBT) و نظریه دلبستگی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeak}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                isSpeaking
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isSpeaking ? "توقف صدا" : "پخش صوتی"}</span>
            </button>

            <button
              onClick={() => setShowAllReport(!showAllReport)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {showAllReport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showAllReport && (
          <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-loose whitespace-pre-line bg-slate-900/60 p-5 rounded-xl border border-slate-800/80">
            {result.aiReport}
          </div>
        )}
      </div>

      {/* Next Step Recommendations Hub */}
      <div className="glass-card rounded-2xl p-6 shadow-xl border border-slate-800">
        <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <span>ابزارهای مکمل پیشنهادی برای ارتقای سلامت رابطه</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div
            id="rec-conflict"
            onClick={() => {
              playClickSound();
              onNavigateToTab("conflict");
            }}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm mb-1">تعمیرگاه تعارض و NVC</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              خنثی‌سازی مشاجرات با متد ۴ سوار گاتمن و تولید جملات آماده.
            </p>
          </div>

          <div
            id="rec-roleplay"
            onClick={() => {
              playClickSound();
              onNavigateToTab("roleplay");
            }}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm mb-1">شبیه‌ساز سناریوهای بحرانی</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تمرین تعاملی بازی‌نقش با پارتنر هوش مصنوعی و ارزیابی هوش هیجانی.
            </p>
          </div>

          <div
            id="rec-values"
            onClick={() => {
              playClickSound();
              onNavigateToTab("values");
            }}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm mb-1">ماتریس ارزش‌ها و آینده</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              مقایسه ۸ ستون اصلی زندگی مشترک و ۱۰ گفتگوی حیاتی قبل از تعهد.
            </p>
          </div>

          <div
            id="rec-coach"
            onClick={() => {
              playClickSound();
              onNavigateToTab("coach");
            }}
            className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm mb-1">مربی هوشمند AI</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              مشاوره مستقیم و محرمانه با استناد به کارنامه روانشناسی شما.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
