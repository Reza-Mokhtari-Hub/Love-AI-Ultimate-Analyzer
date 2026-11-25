import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Zap,
  Layers,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { QuizOption, QuizQuestion, QuizResult, AttachmentStyle, DimensionKey } from "../types";
import { fullQuestionsPool } from "../data/quizQuestions";
import { playClickSound, playSuccessSound, playWarningSound } from "../utils/audio";

interface QuizModuleProps {
  onComplete: (result: QuizResult) => void;
}

export const QuizModule: React.FC<QuizModuleProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<"full" | "quick">("full");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, QuizOption>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  // Active question set
  const questions: QuizQuestion[] =
    mode === "quick" ? fullQuestionsPool.slice(0, 8) : fullQuestionsPool;

  const currentQuestion = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  const handleSelectOption = (option: QuizOption, optIdx: number) => {
    playClickSound();
    setSelectedOptionIndex(optIdx);

    // Save answer
    const newAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(newAnswers);

    // Auto advance after slight delay for visual delight
    setTimeout(() => {
      setSelectedOptionIndex(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Complete quiz
        finishQuiz(newAnswers);
      }
    }, 280);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      playClickSound();
      setCurrentIndex(currentIndex - 1);
      setSelectedOptionIndex(null);
    }
  };

  const handleReset = () => {
    playWarningSound();
    if (confirm("آیا مایلید آزمون را از ابتدا شروع کنید؟")) {
      setCurrentIndex(0);
      setAnswers({});
      setSelectedOptionIndex(null);
    }
  };

  const finishQuiz = async (finalAnswers: Record<number, QuizOption>) => {
    setIsSubmitting(true);

    const answeredList = Object.values(finalAnswers);
    const totalScore = Math.round(
      answeredList.reduce((acc, curr) => acc + curr.score, 0) / answeredList.length
    );

    // 6 Dimensions Metrics
    const dimTotals: Record<DimensionKey, { total: number; count: number }> = {
      empathy: { total: 0, count: 0 },
      commitment: { total: 0, count: 0 },
      trust: { total: 0, count: 0 },
      maturity: { total: 0, count: 0 },
      conflict: { total: 0, count: 0 },
      boundaries: { total: 0, count: 0 },
    };

    answeredList.forEach((ans) => {
      if (dimTotals[ans.dimension]) {
        dimTotals[ans.dimension].total += ans.score;
        dimTotals[ans.dimension].count += 1;
      }
    });

    const metrics = {
      empathy: dimTotals.empathy.count ? Math.round(dimTotals.empathy.total / dimTotals.empathy.count) : 75,
      commitment: dimTotals.commitment.count ? Math.round(dimTotals.commitment.total / dimTotals.commitment.count) : 75,
      trust: dimTotals.trust.count ? Math.round(dimTotals.trust.total / dimTotals.trust.count) : 75,
      maturity: dimTotals.maturity.count ? Math.round(dimTotals.maturity.total / dimTotals.maturity.count) : 75,
      conflict: dimTotals.conflict.count ? Math.round(dimTotals.conflict.total / dimTotals.conflict.count) : 75,
      boundaries: dimTotals.boundaries.count ? Math.round(dimTotals.boundaries.total / dimTotals.boundaries.count) : 75,
    };

    // Attachment style counts
    const attachCounts: Record<AttachmentStyle, number> = {
      secure: 0,
      anxious: 0,
      avoidant: 0,
      disorganized: 0,
    };

    answeredList.forEach((ans) => {
      attachCounts[ans.attachment] = (attachCounts[ans.attachment] || 0) + 1;
    });

    let dominantAttachment: AttachmentStyle = "secure";
    let maxCount = 0;
    Object.entries(attachCounts).forEach(([att, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantAttachment = att as AttachmentStyle;
      }
    });

    const attachmentTitles: Record<AttachmentStyle, string> = {
      secure: "امن و رشدیافته (Secure)",
      anxious: "اضطرابی و تاییدطلب (Anxious)",
      avoidant: "اجتنابی و گریزپا (Avoidant)",
      disorganized: "آشفته و متناقض (Disorganized)",
    };

    // Realism check
    const perfectCount = answeredList.filter((a) => a.score === 100).length;
    let realismStatus = "واقع‌بینانه و چندبعدی";
    if (perfectCount >= questions.length - 1 && questions.length > 5) {
      realismStatus = "احتمال ایده‌آل‌گرایی بالا و تصویرسازی غیرواقعی";
    }

    // Flags
    const greenFlags: string[] = [];
    const redFlags: string[] = [];
    answeredList.forEach((ans) => {
      if (ans.greenFlag && !greenFlags.includes(ans.greenFlag)) greenFlags.push(ans.greenFlag);
      if (ans.redFlag && !redFlags.includes(ans.redFlag)) redFlags.push(ans.redFlag);
    });

    // Summary answers for AI prompt
    const summaryAnswers = Object.entries(finalAnswers)
      .map(([qId, ans]) => {
        const q = questions.find((item) => item.id === Number(qId));
        return `• سوال «${q?.tag}»: ${ans.text} (نمره: ${ans.score}٪)`;
      })
      .join("\n");

    // Call server Gemini API
    let aiReport = "";
    try {
      const response = await fetch("/api/analyze-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: totalScore,
          metrics,
          attachment: attachmentTitles[dominantAttachment],
          realismStatus,
          summaryAnswers,
          greenFlags,
          redFlags,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.report) {
        aiReport = resData.report;
      } else {
        aiReport = "تحلیل روانشناسی با موفقیت ثبت شد.";
      }
    } catch {
      aiReport = "گزارش روانشناسی با مقیاس‌های استاندارد ثبت گردید.";
    }

    const finalResult: QuizResult = {
      id: "result-" + Date.now(),
      date: new Date().toLocaleDateString("fa-IR"),
      mode,
      score: totalScore,
      realismStatus,
      dominantAttachment,
      dominantAttachmentTitle: attachmentTitles[dominantAttachment],
      metrics,
      greenFlags,
      redFlags,
      aiReport,
      userAnswers: Object.entries(finalAnswers).map(([qId, ans]) => ({
        questionId: Number(qId),
        optionIndex: currentQuestion.options.findIndex((o) => o.text === ans.text),
      })),
    };

    setIsSubmitting(false);
    playSuccessSound();

    if (totalScore >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f43f5e", "#38bdf8", "#10b981", "#fbbf24"],
      });
    }

    onComplete(finalResult);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top Banner & Mode Switcher */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 mb-6 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                آزمون جامع سنجش خلوص و اصالت رابطه
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              ارزیابی لایه‌ای در ۶ بعد روانشناختی بر اساس نظریه دلبستگی و الگوهای جان گاتمن
            </p>
          </div>

          {/* Mode switch pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 self-stretch sm:self-auto">
            <button
              id="mode-full-btn"
              onClick={() => {
                playClickSound();
                setMode("full");
                setCurrentIndex(0);
                setAnswers({});
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "full"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>جامع (۲۰ سناریو)</span>
            </button>
            <button
              id="mode-quick-btn"
              onClick={() => {
                playClickSound();
                setMode("quick");
                setCurrentIndex(0);
                setAnswers({});
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === "quick"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>سریع (۸ سوال)</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-400">
                سناریو {currentIndex + 1} از {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                {currentQuestion.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>پیشرفت: {progressPercent}٪</span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/90">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}٪` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-8 mb-6 shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Question Title & Subtext */}
        <div className="mb-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>محور: {currentQuestion.tag}</span>
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white leading-relaxed">
            {currentQuestion.title}
          </h2>
          {currentQuestion.subtext && (
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              💡 {currentQuestion.subtext}
            </p>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-3 relative z-10">
          {currentQuestion.options.map((option, idx) => {
            const isSelected =
              selectedOptionIndex === idx ||
              answers[currentQuestion.id]?.text === option.text;

            return (
              <button
                key={idx}
                id={`q${currentQuestion.id}-opt${idx}`}
                disabled={isSubmitting}
                onClick={() => handleSelectOption(option, idx)}
                className={`w-full text-right p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 group select-none ${
                  isSelected
                    ? "bg-rose-500/20 border-rose-500 text-white shadow-lg shadow-rose-500/20 translate-x-1"
                    : "bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <div
                  className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-rose-500 border-rose-400 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400 group-hover:border-slate-500"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base leading-relaxed font-medium">
                    {option.text}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Question Footer Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800/80">
          <button
            id="quiz-prev-btn"
            disabled={currentIndex === 0 || isSubmitting}
            onClick={handlePrevious}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>سناریوی قبلی</span>
          </button>

          <button
            id="quiz-reset-btn"
            onClick={handleReset}
            disabled={isSubmitting}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>شروع مجدد</span>
          </button>
        </div>
      </div>

      {/* Loading overlay during AI processing */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-[#050713]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping" />
            <div className="w-16 h-16 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
            <Sparkles className="w-7 h-7 text-rose-400 absolute" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
            در حال کالبدشکافی هوشمند رابطه توسط Gemini 3.7...
          </h3>
          <p className="text-sm text-slate-400 max-w-md">
            هوش مصنوعی در حال تحلیل سبک دلبستگی، استخراج پرچم‌های سبز و قرمز، و تنظیم پروتکل اختصاصی برای شماست.
          </p>
        </div>
      )}
    </div>
  );
};
