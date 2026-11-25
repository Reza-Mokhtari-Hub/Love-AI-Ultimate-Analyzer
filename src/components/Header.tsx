import React from "react";
import {
  Heart,
  Volume2,
  VolumeX,
  History,
  Info,
  Sparkles,
  ShieldAlert,
  Flame,
  MessageSquare,
  Activity,
  BookOpen,
  Bot,
  HeartHandshake,
  Gamepad2,
  Compass,
  Brain,
} from "lucide-react";
import { playClickSound } from "../utils/audio";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onOpenInfo: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  onToggleSound,
  onOpenHistory,
  onOpenInfo,
  historyCount,
}) => {
  const tabs = [
    { id: "quiz", label: "سنجش جامع خلوص", icon: Flame },
    { id: "conflict", label: "تعمیرگاه تعارض و NVC", icon: HeartHandshake },
    { id: "roleplay", label: "شبیه‌ساز سناریو و EQ", icon: Gamepad2 },
    { id: "attachment", label: "قطب‌نمای دلبستگی ECR", icon: Brain },
    { id: "values", label: "ماتریس ارزش‌ها و آینده", icon: Compass },
    { id: "lovelang", label: "زبان‌های ۵گانه عشق", icon: Heart },
    { id: "toxic", label: "رادار رفتارهای سمی", icon: ShieldAlert },
    { id: "chat", label: "کالبدشکافی چت و پیام", icon: MessageSquare },
    { id: "timeline", label: "گاهشمار و نوسانات", icon: Activity },
    { id: "coach", label: "مربی هوشمند AI", icon: Bot },
    { id: "wisdom", label: "دانشنامه روانشناسی", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070a1adb]/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div
            id="brand-logo"
            onClick={() => {
              playClickSound();
              setActiveTab("quiz");
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-400 shadow-md shadow-rose-500/30 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#070a1a]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  Love AI Analyzer
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-rose-500/30 to-purple-500/30 text-rose-300 border border-rose-500/40 hidden sm:inline-block">
                  v5.0 Ultimate Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                سامانه فوق‌پیشرفته سنجش خلوص عاطفی، رفتارشناسی و ترمیم روابط
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* AI Engine Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-[11px] text-slate-300 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
              <span>موتور تحلیل: <strong className="text-white">Gemini 3.5 Flash</strong></span>
            </div>

            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                isMuted
                  ? "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-400 hover:bg-rose-500/25"
              }`}
              title={isMuted ? "صدا خاموش است (کلیک برای روشن کردن)" : "صدا فعال است"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* History Modal Trigger */}
            <button
              id="btn-open-history"
              onClick={() => {
                playClickSound();
                onOpenHistory();
              }}
              className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="آرشیو آزمون‌ها"
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Info / Guide */}
            <button
              id="btn-open-info"
              onClick={() => {
                playClickSound();
                onOpenInfo();
              }}
              className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="راهنمای متدولوژی و ابعاد ۶گانه"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Horizontal Scroll */}
        <nav className="flex items-center gap-1.5 sm:gap-2 mt-3 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap select-none ${
                  isActive
                    ? "bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white shadow-md shadow-rose-500/25 scale-[1.02]"
                    : "bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
