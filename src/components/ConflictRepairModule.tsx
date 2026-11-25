import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HeartHandshake,
  Wind,
  Layers,
  Send,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { conflictPresetsList, gottmanFourHorsemenInfo } from "../data/conflictPresets";
import { playClickSound, playSuccessSound } from "../utils/audio";

export const ConflictRepairModule: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [triggerTopic, setTriggerTopic] = useState("");
  const [rawStatement, setRawStatement] = useState("");
  const [partnerReaction, setPartnerReaction] = useState("");
  const [conflictFrequency, setConflictFrequency] = useState("گاهی (هفته‌ای یک‌بار)");

  const [isLoading, setIsLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 4-7-8 Breathing Exercise State
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathCycle, setBreathCycle] = useState(1);

  // Audio Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSelectPreset = (id: string) => {
    playClickSound();
    setSelectedPreset(id);
    const item = conflictPresetsList.find((p) => p.id === id);
    if (item) {
      setTriggerTopic(item.title);
      setRawStatement(item.defaultStatement);
      setPartnerReaction(item.partnerReaction);
    }
  };

  const handleGenerateDeescalation = async () => {
    if (!rawStatement.trim()) {
      alert("لطفاً جمله یا موضوع تعارض را وارد کنید.");
      return;
    }
    playClickSound();
    setIsLoading(true);
    setAnalysisReport(null);

    try {
      const response = await fetch("/api/conflict-deescalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trigger: triggerTopic || "تعارض عاطفی",
          rawStatement,
          partnerReaction,
          conflictFrequency,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisReport(data.analysis);
        playSuccessSound();
      } else {
        setAnalysisReport(data.error || "خطا در دریافت تحلیل تعارض.");
      }
    } catch (err: any) {
      setAnalysisReport("خطا در برقراری ارتباط با سرور هوش مصنوعی.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!analysisReport) return;
    navigator.clipboard.writeText(analysisReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert("مرورگر شما از قابلیت خواندن صوتی پشتیبانی نمی‌کند.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (analysisReport) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(analysisReport.replace(/[*#_`]/g, ""));
      utterance.lang = "fa-IR";
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Breathing Loop
  useEffect(() => {
    let interval: any = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            if (breathPhase === "inhale") {
              setBreathPhase("hold");
              return 7;
            } else if (breathPhase === "hold") {
              setBreathPhase("exhale");
              return 8;
            } else {
              setBreathPhase("inhale");
              setBreathCycle((c) => c + 1);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathTimer(4);
      setBreathPhase("inhale");
      setBreathCycle(1);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreathingActive, breathPhase]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn text-slate-200">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-rose-950/40 p-6 sm:p-8 border border-slate-800 shadow-xl shadow-black/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold mb-3">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>مبتنی بر روانشناسی گاتمن و اصول ارتباط بدون خشونت (NVC)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              تعمیرگاه تعارض و خنثی‌سازی مشاجرات عاطفی
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              هر دلخوری و بحثی را به یک فرصت صمیمیت عمیق تبدیل کنید. این ماژول کلمات تنش‌زا را کالبدشکافی کرده، ۴ سوار ویرانگر رابطه را شناسایی می‌کند و جملات آماده و محترمانه بر پایه فرمول ۴ مرحله‌ای NVC می‌سازد.
            </p>
          </div>

          {/* Quick Flooding Reset Trigger */}
          <button
            id="btn-toggle-breathing"
            onClick={() => {
              playClickSound();
              setIsBreathingActive(!isBreathingActive);
            }}
            className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all border shrink-0 ${
              isBreathingActive
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 animate-pulse"
                : "bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border-amber-500/30 hover:border-amber-500/50"
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>{isBreathingActive ? "توقف تمرین آرام‌سازی" : "تایمر آرام‌سازی طغیان هیجانی (Flooding Reset)"}</span>
          </button>
        </div>

        {/* Interactive 4-7-8 Flooding Calmer Bar */}
        {isBreathingActive && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-6 flex flex-col md:flex-row items-center justify-around gap-6 animate-fadeIn">
            <div className="text-center md:text-right">
              <div className="text-xs font-semibold text-amber-400 mb-1">
                چرخه {breathCycle} از ۴ • پروتکل ۴-۷-۸ کاهش ضربان قلب و آمیگدال
              </div>
              <h3 className="text-lg font-bold text-white">
                {breathPhase === "inhale" && "دم عمیق از بینی (۴ ثانیه)..."}
                {breathPhase === "hold" && "حبس ملایم نفس و آرام‌سازی شانه‌ها (۷ ثانیه)..."}
                {breathPhase === "exhale" && "بازدم کامل و آرام از دهان با صدای هوو (۸ ثانیه)..."}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                وقتی در مشاجره ضربان قلب به بالای ۱۰۰ می‌رسد، قشر منطقی مغز قفل می‌شود. این تمرین مانع از فوران کلمات پشیمان‌کننده می‌شود.
              </p>
            </div>

            {/* Visual Breathing Bubble */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20">
              <div
                className={`absolute rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 opacity-30 transition-all duration-1000 ${
                  breathPhase === "inhale"
                    ? "w-20 h-20 scale-125"
                    : breathPhase === "hold"
                    ? "w-20 h-20 scale-110"
                    : "w-12 h-12 scale-75"
                }`}
              />
              <span className="relative z-10 text-2xl font-black text-white font-mono">
                {breathTimer}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* The 4 Horsemen Mini Knowledge Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white">
            راهنمای فوری: ۴ سوار ویرانگر رابطه در نظریه دکتر گاتمن
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {gottmanFourHorsemenInfo.map((horse, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{horse.emoji}</span>
                <h4 className="text-xs font-bold text-slate-200">{horse.nameFa}</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                {horse.desc}
              </p>
              <div className="pt-2 border-t border-slate-800/60 text-[10.5px] text-emerald-300">
                <strong className="text-emerald-400">پادزهر: </strong>
                {horse.antidoteFa}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Conflict De-escalator Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Input Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-400" />
              <span>مرحله ۱: انتخاب یا ثبت دلخوری و جرقه تعارض</span>
            </h3>

            {/* Quick Presets Carousel */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                انتخاب از تعارضات پرتکرار و سناریوهای آماده:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {conflictPresetsList.map((preset) => (
                  <button
                    key={preset.id}
                    id={`preset-${preset.id}`}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedPreset === preset.id
                        ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.02]"
                        : "bg-slate-800 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60"
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  موضوع یا حوزه اختلاف:
                </label>
                <input
                  type="text"
                  value={triggerTopic}
                  onChange={(e) => setTriggerTopic(e.target.value)}
                  placeholder="مثال: بی‌توجهی به پیام‌ها، نحوه بودجه‌بندی، ارتباط با دوستان..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-colors"
                />
              </div>

              {/* Raw Statement */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  جمله‌ای که گفته شده یا می‌خواهید بگویید (حتی اگر تند یا احساسی است):
                </label>
                <textarea
                  rows={3}
                  value={rawStatement}
                  onChange={(e) => setRawStatement(e.target.value)}
                  placeholder="مثال: تو اصلاً دیگه برای من وقت نمیذاری و همیشه سرت تو گوشیته..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-colors"
                />
              </div>

              {/* Partner Reaction */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  واکنش یا پاسخ پارتنر (در صورت وجود):
                </label>
                <input
                  type="text"
                  value={partnerReaction}
                  onChange={(e) => setPartnerReaction(e.target.value)}
                  placeholder="مثال: قهر کرد، گفت من همیشه طلبکارم، یا سکوت کرد..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-colors"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  فراوانی و تکرار این اختلاف:
                </label>
                <select
                  value={conflictFrequency}
                  onChange={(e) => setConflictFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-rose-500/80"
                >
                  <option value="اولین بار است">برای اولین بار رخ داده</option>
                  <option value="گاهی (ماهی یکی دو بار)">گاهی (ماهی یکی دو بار)</option>
                  <option value="تکرارشونده و هفتگی">تکرارشونده و هفتگی (الگوی ثابت)</option>
                  <option value="مزمن و روزمره">مزمن و روزمره (فرسایشی)</option>
                </select>
              </div>

              {/* Submit CTA */}
              <button
                id="btn-run-conflict-deescalate"
                onClick={handleGenerateDeescalation}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>در حال کالبدشکافی تعارض و استخراج فرمول NVC با Gemini 3.5...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>کالبدشکافی، تشخیص ۴ سوار و بازنویسی NVC</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right / AI Analysis Report Output */}
        <div className="lg:col-span-6">
          <div className="h-full p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-lg flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  گزارش خنثی‌سازی، پادزهرها و جملات آماده گفتگو
                </h3>
              </div>

              {analysisReport && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSpeak}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                      isSpeaking
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                    }`}
                    title="خواندن صوتی متن"
                  >
                    {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{isSpeaking ? "توقف صدا" : "پخش صوتی"}</span>
                  </button>

                  <button
                    onClick={handleCopyReport}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                    title="کپی متن گزارش"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? "کپی شد" : "کپی"}</span>
                  </button>
                </div>
              )}
            </div>

            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
                <h4 className="text-sm font-bold text-white mb-1">
                  روانشناس هوشمند در حال پردازش لایه‌های تعارض...
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  بررسی احتمال وجود Criticism یا Stonewalling، استخراج نیاز زیربنایی، و تدوین گفتگوی امن ۴ مرحله‌ای.
                </p>
              </div>
            )}

            {!isLoading && !analysisReport && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
                <h4 className="text-sm font-semibold text-slate-400 mb-1">
                  هنوز تحلیلی تولید نشده است
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  یکی از سناریوهای آماده را انتخاب کنید یا دلخوری واقعی خود را در فرم سمت راست بنویسید و دکمه را بزنید.
                </p>
              </div>
            )}

            {!isLoading && analysisReport && (
              <div className="flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[550px] pr-1">
                <div className="bg-slate-950/70 p-4 sm:p-5 rounded-xl border border-slate-800 whitespace-pre-line font-sans">
                  {analysisReport}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
