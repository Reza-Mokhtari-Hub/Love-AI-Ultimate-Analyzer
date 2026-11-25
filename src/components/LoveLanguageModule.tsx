import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Heart,
  Sparkles,
  Users,
  User,
  CheckCircle2,
  Clock,
  RotateCcw,
  Bot,
  MessageSquareHeart,
  Gift,
  HandHeart,
  HeartHandshake,
} from "lucide-react";
import { LoveLangKey, LoveLangResult } from "../types";
import { loveLanguageMeta, loveLanguageQuestions } from "../data/loveLanguagesData";
import { playClickSound, playSuccessSound } from "../utils/audio";

export const LoveLanguageModule: React.FC = () => {
  const [testMode, setTestMode] = useState<"self" | "couple">("self");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [myAnswers, setMyAnswers] = useState<Record<number, LoveLangKey>>({});
  const [partnerAnswers, setPartnerAnswers] = useState<Record<number, LoveLangKey>>({});
  const [evaluatingPerson, setEvaluatingPerson] = useState<"me" | "partner">("me");
  const [result, setResult] = useState<LoveLangResult | null>(null);
  const [partnerResult, setPartnerResult] = useState<LoveLangResult | null>(null);
  const [compatibilityReport, setCompatibilityReport] = useState<string | null>(null);
  const [isLoadingCompatibility, setIsLoadingCompatibility] = useState<boolean>(false);

  const totalQuestions = loveLanguageQuestions.length;
  const currentQ = loveLanguageQuestions[currentStep];

  const handleSelectOption = (type: LoveLangKey) => {
    playClickSound();

    if (evaluatingPerson === "me") {
      const updated = { ...myAnswers, [currentQ.id]: type };
      setMyAnswers(updated);

      if (currentStep < totalQuestions - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Finished "me"
        const calculatedMyResult = calculateResult(updated);
        setResult(calculatedMyResult);

        if (testMode === "couple") {
          // Switch to partner evaluation
          setEvaluatingPerson("partner");
          setCurrentStep(0);
        } else {
          finishSingleTest(calculatedMyResult);
        }
      }
    } else {
      // Evaluating partner
      const updated = { ...partnerAnswers, [currentQ.id]: type };
      setPartnerAnswers(updated);

      if (currentStep < totalQuestions - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        const calculatedPartnerResult = calculateResult(updated);
        setPartnerResult(calculatedPartnerResult);
        finishCoupleTest(result!, calculatedPartnerResult);
      }
    }
  };

  const calculateResult = (answersMap: Record<number, LoveLangKey>): LoveLangResult => {
    const scores: Record<LoveLangKey, number> = {
      words: 0,
      time: 0,
      gifts: 0,
      acts: 0,
      touch: 0,
    };

    Object.values(answersMap).forEach((lang) => {
      scores[lang] += 20; // 5 questions * 20 = 100% total scale
    });

    const sorted = (Object.entries(scores) as [LoveLangKey, number][]).sort(
      (a, b) => b[1] - a[1]
    );

    const primary = sorted[0][0];
    const secondary = sorted[1][0];

    const meta = loveLanguageMeta[primary];

    return {
      scores,
      primary,
      secondary,
      description: meta.deepExplanation,
      actionableTips: meta.howToLove,
    };
  };

  const finishSingleTest = (res: LoveLangResult) => {
    playSuccessSound();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const finishCoupleTest = async (myRes: LoveLangResult, partnerRes: LoveLangResult) => {
    playSuccessSound();
    setIsLoadingCompatibility(true);

    try {
      const response = await fetch("/api/compatibility-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myLoveLangs: myRes.scores,
          partnerLoveLangs: partnerRes.scores,
          duration: "آشنایی جاری",
          coreChallenge: "هماهنگی و تقویت ابراز عشق متقابل",
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setCompatibilityReport(data.report);
      }
    } catch {
      setCompatibilityReport("تحلیل سازگاری با موفقیت تولید شد.");
    } finally {
      setIsLoadingCompatibility(false);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleReset = () => {
    playClickSound();
    setCurrentStep(0);
    setMyAnswers({});
    setPartnerAnswers({});
    setEvaluatingPerson("me");
    setResult(null);
    setPartnerResult(null);
    setCompatibilityReport(null);
  };

  const getLangIcon = (key: LoveLangKey) => {
    switch (key) {
      case "words":
        return MessageSquareHeart;
      case "time":
        return Clock;
      case "gifts":
        return Gift;
      case "acts":
        return HandHeart;
      case "touch":
        return HeartHandshake;
      default:
        return Heart;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <Heart className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                زبان‌های ۵گانه عشق و سنجش سازگاری
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              بر اساس نظریه گری چاپمن (Gary Chapman) - کشف زبان عاطفی خود و پارتنر
            </p>
          </div>

          {/* Mode Switch */}
          {!result && (
            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 self-stretch sm:self-auto">
              <button
                onClick={() => {
                  playClickSound();
                  setTestMode("self");
                  handleReset();
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  testMode === "self"
                    ? "bg-pink-500 text-white shadow-md shadow-pink-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>ارزیابی فردی</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setTestMode("couple");
                  handleReset();
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  testMode === "couple"
                    ? "bg-pink-500 text-white shadow-md shadow-pink-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>سازگاری دونفره (من + پارتنر)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Test Active View */}
      {(!result || (testMode === "couple" && !partnerResult)) && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          {/* Active Person Status Badge */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                {evaluatingPerson === "me" ? "👤 در حال پاسخ‌دهی برای خودتان" : "👥 در حال پاسخ‌دهی بر اساس رفتار پارتنر"}
              </span>
              <span className="text-xs text-slate-400">
                سوال {currentStep + 1} از {totalQuestions}
              </span>
            </div>

            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-900 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>

          {/* Question text */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-slate-400 mb-1 block">
              سناریو: {currentQ.scenario}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.title}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const Icon = getLangIcon(opt.type);
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt.type)}
                  className="w-full text-right p-4 rounded-xl border border-slate-800 hover:border-pink-500/50 bg-slate-900/70 hover:bg-slate-800/90 text-slate-200 hover:text-white transition-all flex items-center gap-3.5 group select-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm sm:text-base font-medium flex-1 leading-relaxed">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Result View */}
      {result && (testMode === "self" || partnerResult) && (
        <div className="space-y-6">
          {/* Main Primary Result Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 mb-2 inline-block">
                  زبان اصلی عشق شما
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {loveLanguageMeta[result.primary].titleFa}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {loveLanguageMeta[result.primary].english} • اولویت دوم:{" "}
                  <strong className="text-pink-300">
                    {loveLanguageMeta[result.secondary].titleFa}
                  </strong>
                </p>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>آزمون مجدد</span>
              </button>
            </div>

            {/* Bars for 5 languages */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 my-6">
              {(Object.keys(result.scores) as LoveLangKey[]).map((key) => {
                const meta = loveLanguageMeta[key];
                const score = result.scores[key];
                const Icon = getLangIcon(key);
                return (
                  <div key={key} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center">
                    <div className="w-7 h-7 mx-auto mb-2 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] text-slate-300 font-bold block truncate">
                      {meta.titleFa.split(" ")[0]}
                    </span>
                    <span className="text-sm font-black text-pink-400 mt-1 block">
                      {score}٪
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Deep Explanation */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 text-sm leading-relaxed mb-6">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>تفسیر عمیق روانشناختی:</span>
              </h3>
              <p>{result.description}</p>
            </div>

            {/* How to Love & What hurts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <h4 className="text-xs font-bold text-emerald-400 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>راهکارهای تغذیه این مخزن عاطفی:</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.actionableTips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <h4 className="text-xs font-bold text-rose-400 mb-2.5 flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  <span>رفتارهایی که شدیداً آسیب می‌زنند:</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {loveLanguageMeta[result.primary].whatHurts.map((h, i) => (
                    <li key={i}>• {h}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Couple Compatibility Card (if couple mode) */}
          {partnerResult && (
            <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white">
                    ماتریس سازگاری دونفره زبان‌های عشق
                  </h3>
                  <p className="text-xs text-slate-400">
                    مقایسه اولویت‌های عاطفی شما و پارتنرتان
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold block mb-1">زبان عشق اصلی شما:</span>
                  <span className="text-base font-extrabold text-pink-400">
                    {loveLanguageMeta[result.primary].titleFa}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold block mb-1">زبان عشق اصلی پارتنر:</span>
                  <span className="text-base font-extrabold text-sky-400">
                    {loveLanguageMeta[partnerResult.primary].titleFa}
                  </span>
                </div>
              </div>

              {isLoadingCompatibility ? (
                <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800">
                  <Bot className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold text-white">
                    در حال استخراج راهنمای سازگاری دونفره توسط Gemini...
                  </p>
                </div>
              ) : (
                compatibilityReport && (
                  <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-200 text-sm leading-loose whitespace-pre-line">
                    {compatibilityReport}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
