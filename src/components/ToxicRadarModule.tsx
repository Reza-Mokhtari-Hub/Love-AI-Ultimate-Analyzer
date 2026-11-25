import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import { toxicChecklistItems } from "../data/toxicRadarData";
import { playClickSound, playWarningSound } from "../utils/audio";

export const ToxicRadarModule: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    playClickSound();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    playWarningSound();
    setSelectedIds([]);
  };

  const filteredItems =
    activeCategory === "all"
      ? toxicChecklistItems
      : toxicChecklistItems.filter((i) => i.category === activeCategory);

  // Calculate Toxicity Severity Score
  const totalWeight = toxicChecklistItems.reduce((acc, item) => {
    return acc + (item.severity === "critical" ? 3 : item.severity === "high" ? 2 : 1);
  }, 0);

  const currentWeight = selectedIds.reduce((acc, id) => {
    const item = toxicChecklistItems.find((t) => t.id === id);
    if (!item) return acc;
    return acc + (item.severity === "critical" ? 3 : item.severity === "high" ? 2 : 1);
  }, 0);

  const toxicityPercent = Math.min(100, Math.round((currentWeight / totalWeight) * 100));

  const getThreatLevel = (p: number) => {
    if (p === 0)
      return {
        label: "امن و بدون نشانه‌های سمی حاد",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        advice: "الگوهای مشاهده‌شده حاکی از سلامت عمومی رابطه است.",
      };
    if (p < 25)
      return {
        label: "ریسک خفیف / رفتارهای نابالغانه مقطعی",
        color: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/30",
        advice: "با گفتگوی صریح و تعیین مرزهای کلامی قابل رفع است.",
      };
    if (p < 55)
      return {
        label: "سطح مسمومیت متوسط / زنگ خطرهای جدی",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        advice: "نشانه‌های دستکاری روانی و نقض مرزها در رابطه در حال تثبیت است. نیاز به مرزبندی سخت یا زوج‌درمانی.",
      };
    return {
      label: "سطح مسمومیت بحرانی / خطر فرسایش شدید روانی",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      advice: "حضور در این رابطه با خطرات شدید برای عزت‌نفس و سلامت روان شما همراه است. فوراً از مشاور و حامیان امن کمک بگیرید.",
    };
  };

  const threat = getThreatLevel(toxicityPercent);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6 shadow-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                رادار پیشرفته رفتارهای سمی و دستکاری روانی
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              چک‌لیست تخصصی ۱۲ الگوی مخرب عاطفی (Gaslighting، بمباران عشق، قهر خاموش، باج‌گیری عاطفی و...)
            </p>
          </div>

          {/* Threat Meter Display */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 w-full lg:w-auto">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-bold block">شاخص مسمومیت</span>
              <span className={`text-2xl sm:text-3xl font-black ${threat.color}`}>
                {toxicityPercent}٪
              </span>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div className="flex-1 lg:w-48">
              <span className={`text-xs font-bold block ${threat.color} truncate`}>
                {threat.label}
              </span>
              <div className="w-full h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full ${
                    toxicityPercent >= 55
                      ? "bg-rose-500"
                      : toxicityPercent >= 25
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  } transition-all duration-500`}
                  style={{ width: `${Math.max(5, toxicityPercent)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Threat Level Advice */}
        {selectedIds.length > 0 && (
          <div className={`mt-4 p-3.5 rounded-xl ${threat.bg} ${threat.border} border text-xs sm:text-sm ${threat.color} font-medium`}>
            🛡️ <strong>تحلیل وضعیت:</strong> {threat.advice}
          </div>
        )}
      </div>

      {/* Categories Filter Tabs & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: "همه موارد (۱۲)" },
            { id: "manipulation", label: "دستکاری روانی" },
            { id: "control", label: "کنترل‌گری و نظارت" },
            { id: "communication", label: "ارتباطات تخریبی" },
            { id: "emotional", label: "آسیب‌های هیجانی" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playClickSound();
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>پاک کردن انتخاب‌ها ({selectedIds.length})</span>
          </button>
        )}
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                isSelected
                  ? "bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/10"
                  : "bg-slate-900/60 hover:bg-slate-900/90 border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-3 cursor-pointer flex-1 select-none">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(item.id)}
                    className="mt-1 w-4 h-4 text-rose-500 bg-slate-900 border-slate-700 rounded focus:ring-rose-500 focus:ring-offset-slate-900"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-white">
                        {item.title}
                      </h3>
                      {item.severity === "critical" && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                          بحرانی
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </label>

                <button
                  onClick={() => {
                    playClickSound();
                    setExpandedId(isExpanded ? null : item.id);
                  }}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  title="نمایش نمونه دیالوگ و راهکار"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded details (Example & Coping tip) */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-amber-300">
                    <strong>💬 نمونه دیالوگ واقعی:</strong> {item.example}
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                    <strong>🛡️ استراتژی مرزبندی و پاسخ:</strong> {item.copingTip}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
