import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  Coins,
  Baby,
  Users,
  Briefcase,
  HeartHandshake,
  Flame,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Loader2,
  BookOpen,
} from "lucide-react";
import { initialValuePillars } from "../data/valuesData";
import { ValuePillar } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";

export const ValuesAlignmentModule: React.FC = () => {
  const [pillars, setPillars] = useState<ValuePillar[]>(initialValuePillars);
  const [relationshipGoal, setRelationshipGoal] = useState("ازدواج و زندگی مشترک رسمی");
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [alignmentReport, setAlignmentReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleScoreChange = (id: string, field: "myScore" | "partnerScore", value: number) => {
    setPillars((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Calculations
  const calculateOverallAlignment = () => {
    let totalDiff = 0;
    pillars.forEach((p) => {
      totalDiff += Math.abs(p.myScore - p.partnerScore);
    });
    const avgDiff = totalDiff / pillars.length;
    return Math.max(0, Math.round(100 - avgDiff));
  };

  const overallScore = calculateOverallAlignment();

  const getHighGaps = () => {
    return pillars
      .filter((p) => Math.abs(p.myScore - p.partnerScore) >= 25)
      .map((p) => p.title);
  };

  const getStrongSynergies = () => {
    return pillars
      .filter((p) => Math.abs(p.myScore - p.partnerScore) <= 12 && p.myScore >= 70)
      .map((p) => p.title);
  };

  const handleGenerateReport = async () => {
    playClickSound();
    setIsLoading(true);
    setAlignmentReport(null);

    const highGaps = getHighGaps();
    const strongSynergies = getStrongSynergies();

    try {
      const response = await fetch("/api/values-alignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: pillars.map((p) => ({
            title: p.title,
            myScore: p.myScore,
            partnerScore: p.partnerScore,
            gap: Math.abs(p.myScore - p.partnerScore),
          })),
          overallScore,
          relationshipGoal,
          highGaps,
          strongSynergies,
        }),
      });

      const data = await response.json();
      if (data.success && data.report) {
        setAlignmentReport(data.report);
        playSuccessSound();
      } else {
        setAlignmentReport(data.error || "خطا در دریافت تحلیل ارزش‌ها.");
      }
    } catch {
      setAlignmentReport("خطا در برقراری ارتباط با مدل هوش مصنوعی.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!alignmentReport) return;
    navigator.clipboard.writeText(alignmentReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (alignmentReport) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(alignmentReport.replace(/[*#_`]/g, ""));
      utterance.lang = "fa-IR";
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case "Baby":
        return <Baby className="w-4 h-4 text-pink-400" />;
      case "Coins":
        return <Coins className="w-4 h-4 text-amber-400" />;
      case "Users":
        return <Users className="w-4 h-4 text-blue-400" />;
      case "Briefcase":
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case "Compass":
        return <Compass className="w-4 h-4 text-purple-400" />;
      case "Sparkles":
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case "HeartHandshake":
        return <HeartHandshake className="w-4 h-4 text-rose-400" />;
      case "Flame":
        return <Flame className="w-4 h-4 text-rose-500" />;
      default:
        return <Compass className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn text-slate-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/80 via-slate-900/90 to-indigo-950/50 p-6 sm:p-8 border border-purple-800/60 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>ماتریس ارزیابی سازگاری اهداف بنیادین و پیش از تعهد رسمی</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              ماتریس هم‌راستایی ارزش‌های محوری و آینده مشترک
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              عشق احساسی آتشین است، اما ازدواج و تعهد بلندمدت نیازمند هم‌راستایی در ارزش‌هاست. ۸ ستون اساسی زندگی مشترک (مالی، فرزندآوری، استقلال، خانواده و...) را با اسلایدرها مقایسه کنید تا مناطق هم‌افزا و نقاط اصطکاک را شفاف ببینید.
            </p>
          </div>

          {/* Big Score Dial */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 shrink-0 shadow-lg text-center">
            <div className="text-[11px] font-semibold text-slate-400">شاخص هم‌راستایی کل:</div>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 my-1 font-mono">
              {overallScore}٪
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                overallScore >= 75
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : overallScore >= 55
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {overallScore >= 75 ? "هم‌راستایی ایده‌آل" : overallScore >= 55 ? "نیازمند گفتگوی عمیق" : "شکاف‌های پرخطر"}
            </span>
          </div>
        </div>
      </div>

      {/* Target Goal Selector */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-300">
          چشم‌انداز و مرحله کنونی رابطه:
        </label>
        <select
          value={relationshipGoal}
          onChange={(e) => setRelationshipGoal(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
        >
          <option value="ازدواج و زندگی مشترک رسمی">ازدواج و زندگی مشترک رسمی</option>
          <option value="آشنایی جدی و پیش از نامزدی">آشنایی جدی و پیش از نامزدی</option>
          <option value="ارتقای کیفیت زندگی مشترک زناشویی">ارتقای کیفیت زندگی مشترک زناشویی</option>
          <option value="تصمیم‌گیری درباره ادامه یا خاتمه رابطه">تصمیم‌گیری درباره ادامه یا خاتمه رابطه</option>
        </select>
      </div>

      {/* Main 8 Pillars Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>تنظیم اسلایدرهای ۸ ستون ارزش‌ها (اولویت و حساسیت من در مقابل پارتنر)</span>
          </h3>
          <span className="text-xs text-slate-400">مقیاس ۰ تا ۱۰۰</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar) => {
            const gap = Math.abs(pillar.myScore - pillar.partnerScore);
            const isHighGap = gap >= 25;
            const isExpanded = expandedPillar === pillar.id;

            return (
              <div
                key={pillar.id}
                className={`p-4 sm:p-5 rounded-2xl bg-slate-900/90 border transition-all ${
                  isHighGap
                    ? "border-amber-500/50 shadow-md shadow-amber-500/10"
                    : "border-slate-800/90 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {renderIcon(pillar.iconName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">
                        {pillar.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">{pillar.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isHighGap
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      شکاف: {gap}٪
                    </span>
                    <button
                      onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                      className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      title="مشاهده پرسش‌های طلایی این ستون"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  {pillar.description}
                </p>

                {/* Sliders Controls */}
                <div className="space-y-2.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  {/* My Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>اهمیت/اولویت برای من:</span>
                      <span className="text-purple-400 font-mono font-bold">{pillar.myScore}٪</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={pillar.myScore}
                      onChange={(e) => handleScoreChange(pillar.id, "myScore", Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  {/* Partner Score */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>اهمیت/اولویت برای پارتنر:</span>
                      <span className="text-pink-400 font-mono font-bold">{pillar.partnerScore}٪</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={pillar.partnerScore}
                      onChange={(e) => handleScoreChange(pillar.id, "partnerScore", Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>

                {/* Expanded Key Pre-commitment Questions */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-300 space-y-1.5 animate-fadeIn">
                    <div className="font-bold text-amber-400 text-[10.5px]">
                      پرسش‌های ضروری قبل از تعهد در این حوزه:
                    </div>
                    {pillar.keyQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button & AI Analysis Engine */}
      <div className="space-y-4">
        <button
          id="btn-run-values-alignment"
          onClick={handleGenerateReport}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>در حال تولید کالبدشکافی هم‌راستایی ارزش‌ها با Gemini 3.5...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>تولید گزارش جامع سازگاری ارزش‌ها، اصطکاک‌ها و ۵ سوال حیاتی</span>
            </>
          )}
        </button>

        {/* AI Output Box */}
        {alignmentReport && (
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>گزارش جامع مشاوره هم‌راستایی ارزش‌ها</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSpeak}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    isSpeaking
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isSpeaking ? "توقف صدا" : "پخش صوتی"}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? "کپی شد" : "کپی"}</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {alignmentReport}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
