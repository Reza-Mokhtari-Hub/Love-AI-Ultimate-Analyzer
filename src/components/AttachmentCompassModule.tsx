import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  Heart,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Loader2,
  Brain,
  Shield,
  Layers,
} from "lucide-react";
import { ecrQuestionsList, ecrQuadrantsMeta } from "../data/attachmentECRData";
import { ECRResult } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";
import confetti from "canvas-confetti";

export const AttachmentCompassModule: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [ecrResult, setEcrResult] = useState<ECRResult | null>(null);

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [deepAiReport, setDeepAiReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const totalQuestions = ecrQuestionsList.length;
  const currentQ = ecrQuestionsList[currentStep];

  const handleSelectOption = (qId: number, val: number) => {
    playClickSound();
    const nextAnswers = { ...answers, [qId]: val };
    setAnswers(nextAnswers);

    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calculate ECR Score
      calculateECR(nextAnswers);
    }
  };

  const calculateECR = (allAnswers: Record<number, number>) => {
    let anxietyTotal = 0;
    let anxietyCount = 0;
    let avoidanceTotal = 0;
    let avoidanceCount = 0;

    ecrQuestionsList.forEach((q) => {
      let score = allAnswers[q.id] || 3; // 1 to 5
      if (q.isReverse) {
        score = 6 - score; // Reverse scoring
      }

      if (q.dimension === "anxiety") {
        anxietyTotal += score;
        anxietyCount++;
      } else {
        avoidanceTotal += score;
        avoidanceCount++;
      }
    });

    const anxietyAvg = anxietyTotal / anxietyCount; // 1 to 5
    const avoidanceAvg = avoidanceTotal / avoidanceCount; // 1 to 5

    // Normalize to 0 - 100%
    const anxietyScore = Math.round(((anxietyAvg - 1) / 4) * 100);
    const avoidanceScore = Math.round(((avoidanceAvg - 1) / 4) * 100);

    // Determine Quadrant (Threshold: 50%)
    let quad: "secure" | "anxious" | "avoidant" | "fearful";
    if (anxietyScore < 50 && avoidanceScore < 50) {
      quad = "secure";
    } else if (anxietyScore >= 50 && avoidanceScore < 50) {
      quad = "anxious";
    } else if (anxietyScore < 50 && avoidanceScore >= 50) {
      quad = "avoidant";
    } else {
      quad = "fearful";
    }

    const meta = ecrQuadrantsMeta[quad];
    const res: ECRResult = {
      anxietyScore,
      avoidanceScore,
      quadrant: quad,
      titleFa: meta.titleFa,
      subtitleFa: meta.subtitleFa,
      explanation: meta.explanation,
      healingPractices: meta.healingPractices,
      partnerAdvice: meta.partnerAdvice,
    };

    setEcrResult(res);
    setIsCompleted(true);
    playSuccessSound();

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  const handleReset = () => {
    playClickSound();
    setAnswers({});
    setCurrentStep(0);
    setIsCompleted(false);
    setEcrResult(null);
    setDeepAiReport(null);
  };

  const handleGenerateDeepAnalysis = async () => {
    if (!ecrResult) return;
    playClickSound();
    setIsLoadingAi(true);
    setDeepAiReport(null);

    try {
      const response = await fetch("/api/attachment-deep-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anxietyScore: ecrResult.anxietyScore,
          avoidanceScore: ecrResult.avoidanceScore,
          quadrantTitle: ecrResult.titleFa,
          topTriggers: ["ترس از رهاشدگی", "نیاز به استقلال یا تایید"],
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setDeepAiReport(data.report);
        playSuccessSound();
      } else {
        setDeepAiReport(data.error || "خطا در تولید گزارش.");
      }
    } catch {
      setDeepAiReport("خطا در برقراری ارتباط با هوش مصنوعی.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const toggleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (deepAiReport) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(deepAiReport.replace(/[*#_`]/g, ""));
      utterance.lang = "fa-IR";
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn text-slate-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-950/80 via-slate-900/90 to-slate-900/90 p-6 sm:p-8 border border-teal-800/60 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold mb-3">
              <Brain className="w-3.5 h-3.5" />
              <span>مقیاس استاندارد تجارب در روابط نزدیک (ECR Adult Attachment Scale)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              قطب‌نمای دوبُعدی سبک‌های دلبستگی عاطفی
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              ریشه اکثر سوءتفاهم‌ها و قفل شدن‌های عاطفی در سبک دلبستگی ناخودآگاه ما قرار دارد. با پاسخ به ۱۲ گویه استاندارد، جایگاه دقیق خود را در دستگاه مختصات دکارتی اضطراب/اجتناب و نقشه بازسیم‌کشی به سوی دلبستگی امن بیابید.
            </p>
          </div>

          {isCompleted && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-all shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>انجام مجدد تست</span>
            </button>
          )}
        </div>
      </div>

      {/* Test Questions Flow */}
      {!isCompleted && (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
              <span>گویه {currentStep + 1} از {totalQuestions}</span>
              <span>{Math.round(((currentStep + 1) / totalQuestions) * 100)}٪ تکمیل شده</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-4 text-center">
            <span className="inline-block px-3 py-1 rounded-md bg-teal-500/10 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/20">
              {currentQ.dimension === "anxiety" ? "محور حساسیت و اضطراب رابطه" : "محور فاصله و اجتناب از صمیمیت"}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white max-w-xl mx-auto leading-relaxed">
              «{currentQ.text}»
            </h3>
          </div>

          {/* 5-point Likert Options */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 max-w-3xl mx-auto pt-2">
            {[
              { val: 1, label: "کاملاً مخالفم" },
              { val: 2, label: "کمی مخالفم" },
              { val: 3, label: "خنثی / بینابین" },
              { val: 4, label: "کمی موافقم" },
              { val: 5, label: "کاملاً موافقم" },
            ].map((opt) => (
              <button
                key={opt.val}
                id={`btn-ecr-opt-${opt.val}`}
                onClick={() => handleSelectOption(currentQ.id, opt.val)}
                className="py-3 px-2 rounded-xl bg-slate-950/80 hover:bg-teal-900/40 border border-slate-800 hover:border-teal-500/60 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-md flex flex-col items-center justify-center gap-1 text-center"
              >
                <span className="text-xs text-teal-400/80 font-mono font-bold">({opt.val})</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result Display & 2D Quadrant Plane */}
      {isCompleted && ecrResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: 2D Cartesian Quadrant Canvas/Visualizer */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-teal-400" />
                <span>دستگاه مختصات دلبستگی (Cartesian Plane)</span>
              </h3>

              {/* 2D Plane Box */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-inner p-2">
                {/* Quadrants Grid */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  {/* Top-Right: Fearful (High Anxiety, High Avoidance) */}
                  <div className="border-b border-l border-slate-800 p-2 flex flex-col items-start justify-start">
                    <span className="text-[9px] font-bold text-purple-400/70">ترسو-آشفته</span>
                  </div>
                  {/* Top-Left: Anxious (High Anxiety, Low Avoidance) */}
                  <div className="border-b border-slate-800 p-2 flex flex-col items-end justify-start">
                    <span className="text-[9px] font-bold text-rose-400/70">اضطرابی-مجذوب</span>
                  </div>
                  {/* Bottom-Right: Avoidant (Low Anxiety, High Avoidance) */}
                  <div className="border-l border-slate-800 p-2 flex flex-col items-start justify-end">
                    <span className="text-[9px] font-bold text-amber-400/70">اجتنابی-طردکننده</span>
                  </div>
                  {/* Bottom-Left: Secure (Low Anxiety, Low Avoidance) */}
                  <div className="p-2 flex flex-col items-end justify-end">
                    <span className="text-[9px] font-bold text-emerald-400/80 font-bold">امن (Secure)</span>
                  </div>
                </div>

                {/* Axes Labels */}
                <div className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-bold">
                  محور اجتناب →
                </div>
                <div className="absolute top-2 right-2 text-[9px] text-slate-400 font-bold">
                  ↑ محور اضطراب
                </div>

                {/* Plot Point */}
                <div
                  className="absolute w-5 h-5 rounded-full bg-teal-400 border-2 border-white shadow-lg shadow-teal-400/80 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-20 flex items-center justify-center animate-bounce"
                  style={{
                    left: `${Math.max(10, Math.min(90, ecrResult.avoidanceScore))}%`,
                    bottom: `${Math.max(10, Math.min(90, 100 - ecrResult.anxietyScore))}%`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                </div>
              </div>

              {/* Coordinates read-out */}
              <div className="mt-4 flex items-center gap-4 text-xs font-mono">
                <span className="text-rose-300">
                  اضطراب: <strong>{ecrResult.anxietyScore}٪</strong>
                </span>
                <span className="text-amber-300">
                  اجتناب: <strong>{ecrResult.avoidanceScore}٪</strong>
                </span>
              </div>
            </div>

            {/* Right: Quadrant Analysis Profile */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-black">
                <Heart className="w-3.5 h-3.5" />
                <span>سبک دلبستگی غالب شما:</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {ecrResult.titleFa}
              </h2>
              <div className="text-xs text-slate-400 font-medium">
                {ecrResult.subtitleFa}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                {ecrResult.explanation}
              </p>

              {/* Healing Practices */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تمرین‌های اختصاصی بازسیم‌کشی به سوی دلبستگی امن:</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {ecrResult.healingPractices.map((prac, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-teal-400 font-bold">•</span>
                      <span>{prac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Deep AI Report CTA */}
          <div className="space-y-4">
            <button
              id="btn-run-attachment-deep-ai"
              onClick={handleGenerateDeepAnalysis}
              disabled={isLoadingAi}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-500 text-white shadow-xl shadow-teal-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoadingAi ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال تولید تحلیل عصب‌روانشناختی دلبستگی با Gemini 3.5...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>تولید گزارش جامع ترمیم زخم‌های عاطفی و کدهای گفتگوی امن</span>
                </>
              )}
            </button>

            {deepAiReport && (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-teal-400" />
                    <span>گزارش تخصصی روان‌درمانی و رشد دلبستگی</span>
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSpeak}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                        isSpeaking
                          ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isSpeaking ? "توقف صدا" : "پخش صوتی"}</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(deepAiReport);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{copied ? "کپی شد" : "کپی"}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {deepAiReport}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
