import React, { useState } from "react";
import {
  Gamepad2,
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  User,
  Shield,
  Activity,
  Heart,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Volume2,
  VolumeX,
  Loader2,
  Award,
} from "lucide-react";
import { roleplayScenariosList } from "../data/roleplayScenarios";
import { RoleplayScenarioItem, RoleplayTurn } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";
import confetti from "canvas-confetti";

export const RoleplaySimulatorModule: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenarioItem>(roleplayScenariosList[0]);
  const [turns, setTurns] = useState<RoleplayTurn[]>([
    {
      id: "init",
      sender: "partner",
      text: roleplayScenariosList[0].initialMessage,
      mood: roleplayScenariosList[0].partnerInitialMood,
      timestamp: "اکنون",
    },
  ]);

  const [customInput, setCustomInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentMood, setCurrentMood] = useState(roleplayScenariosList[0].partnerInitialMood);
  const [eqScore, setEqScore] = useState<number>(75);
  const [safetyScore, setSafetyScore] = useState<number>(70);
  const [isResolved, setIsResolved] = useState(false);
  const [speakingTurnId, setSpeakingTurnId] = useState<string | null>(null);

  const handleSelectScenario = (scen: RoleplayScenarioItem) => {
    playClickSound();
    setSelectedScenario(scen);
    setCurrentMood(scen.partnerInitialMood);
    setEqScore(75);
    setSafetyScore(70);
    setIsResolved(false);
    setTurns([
      {
        id: "init",
        sender: "partner",
        text: scen.initialMessage,
        mood: scen.partnerInitialMood,
        timestamp: "اکنون",
      },
    ]);
  };

  const handleResetSimulation = () => {
    playClickSound();
    setIsResolved(false);
    setCurrentMood(selectedScenario.partnerInitialMood);
    setEqScore(75);
    setSafetyScore(70);
    setTurns([
      {
        id: "init",
        sender: "partner",
        text: selectedScenario.initialMessage,
        mood: selectedScenario.partnerInitialMood,
        timestamp: "اکنون",
      },
    ]);
  };

  const executeTurn = async (userText: string) => {
    if (!userText.trim() || isProcessing) return;
    playClickSound();

    const userTurn: RoleplayTurn = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: "همین حالا",
    };

    const newTurns = [...turns, userTurn];
    setTurns(newTurns);
    setCustomInput("");
    setIsProcessing(true);

    try {
      const response = await fetch("/api/roleplay-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: selectedScenario.title,
          scenarioDescription: selectedScenario.context,
          conversationHistory: newTurns.map((t) => ({
            role: t.sender === "user" ? "user" : "partner",
            text: t.text,
          })),
          userActionOrText: userText,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        const partnerTurn: RoleplayTurn = {
          id: `p-${Date.now()}`,
          sender: "partner",
          text: d.partnerReply || "متوجهم... بیا بیشتر صحبت کنیم.",
          mood: d.partnerMood || "پذیرا",
          eqScore: d.eqScore ?? 80,
          safetyScore: d.psychologicalSafety ?? 75,
          coachingTip: d.coachingTip,
          timestamp: "پاسخ زنده",
        };

        setTurns((prev) => [...prev, partnerTurn]);
        if (d.partnerMood) setCurrentMood(d.partnerMood);
        if (d.eqScore !== undefined) setEqScore(d.eqScore);
        if (d.psychologicalSafety !== undefined) setSafetyScore(d.psychologicalSafety);

        if (d.isResolved) {
          setIsResolved(true);
          playSuccessSound();
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
            });
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
      const fallbackTurn: RoleplayTurn = {
        id: `p-${Date.now()}`,
        sender: "partner",
        text: "حرفت رو شنیدم. حس می‌کنم الان فضا داره بهتر میشه.",
        mood: "آرام‌شده",
        coachingTip: "پاسخ متین شما به کاهش بار هیجانی کمک کرد.",
        timestamp: "همین حالا",
      };
      setTurns((prev) => [...prev, fallbackTurn]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpeakText = (id: string, text: string) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingTurnId === id) {
      window.speechSynthesis.cancel();
      setSpeakingTurnId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fa-IR";
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingTurnId(null);
      utterance.onerror = () => setSpeakingTurnId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingTurnId(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn text-slate-200">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/50 p-6 sm:p-8 border border-indigo-800/60 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>محیط شبیه‌سازی هوشمند و تمرین تصمیم‌گیری‌های پرریسک عاطفی</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              شبیه‌ساز سناریوهای بحرانی و بازی‌نقش (EQ Roleplay)
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              مهارت‌های هوش هیجانی خود را در سناریوهای دشوار رابطه (مانند سردی، مسائل مالی یا مداخله خانواده) بسنجید. هوش مصنوعی در نقش پارتنر با خلق‌وخوی پویا واکنش نشان داده و امنیت روانی کلام شما را ارزیابی می‌کند.
            </p>
          </div>

          <button
            onClick={handleResetSimulation}
            className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>شروع مجدد این سناریو</span>
          </button>
        </div>
      </div>

      {/* Scenario Selector Ribbon */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400">
          انتخاب سناریوی چالشی برای تمرین:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roleplayScenariosList.map((scen) => {
            const isSelected = selectedScenario.id === scen.id;
            return (
              <div
                key={scen.id}
                onClick={() => handleSelectScenario(scen)}
                className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? "bg-indigo-900/40 border-indigo-500 shadow-md shadow-indigo-500/20 scale-[1.01]"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="font-bold text-xs text-white mb-1">{scen.title}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {scen.shortDesc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Chat Simulation Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col min-h-[500px]">
            {/* Scenario Context Bar */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 flex items-start gap-2.5 text-xs text-slate-300">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">بستر سناریو: </strong>
                {selectedScenario.context}
              </div>
            </div>

            {/* Live Message History */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 max-h-[380px]">
              {turns.map((t) => {
                const isUser = t.sender === "user";
                return (
                  <div
                    key={t.id}
                    className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                      {isUser ? (
                        <>
                          <User className="w-3 h-3 text-emerald-400" />
                          <span>شما</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-indigo-400" />
                          <span>پارتنر (هوش مصنوعی)</span>
                          {t.mood && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                              حال: {t.mood}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                        isUser
                          ? "bg-emerald-950/60 border border-emerald-800/80 text-emerald-100 rounded-tr-none"
                          : "bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none"
                      }`}
                    >
                      <p>{t.text}</p>

                      {/* Partner TTS Button */}
                      {!isUser && (
                        <button
                          onClick={() => handleSpeakText(t.id, t.text)}
                          className="mt-2 text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                        >
                          {speakingTurnId === t.id ? (
                            <VolumeX className="w-3 h-3 text-rose-400" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                          <span>{speakingTurnId === t.id ? "توقف صدا" : "شنیدن صوت"}</span>
                        </button>
                      )}

                      {/* Mini Coaching Tip */}
                      {t.coachingTip && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10.5px] text-amber-300/90 flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{t.coachingTip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isProcessing && (
                <div className="flex items-center gap-2 text-xs text-indigo-300 animate-pulse py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>پارتنر در حال پردازش واکنش و ارزیابی پاسخ شما...</span>
                </div>
              )}
            </div>

            {/* Resolution Banner */}
            {isResolved && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-3 text-emerald-200 animate-fadeIn">
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-100">
                    تبریک! تعارض با موفقیت و درک متقابل حل شد.
                  </h4>
                  <p className="text-[11px] text-emerald-300/90 mt-0.5">
                    شما با تکیه بر مرزبندی محترمانه و لحن همدلانه، امنیت روانی پارتنر را حفظ و گفتگو را به نقطه امن رساندید.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Preset Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400">
                پاسخ‌های پیشنهادی بر اساس سبک‌های رفتاری:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedScenario.presetResponses.map((res, i) => (
                  <button
                    key={i}
                    disabled={isProcessing || isResolved}
                    onClick={() => executeTurn(res.text)}
                    className="p-2.5 text-right rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 text-[11.5px] text-slate-200 transition-all disabled:opacity-50 group flex flex-col justify-between"
                  >
                    <span className="font-bold text-[10px] text-indigo-400 mb-1">
                      {res.label}
                    </span>
                    <span className="text-slate-300 line-clamp-2">{res.text}</span>
                  </button>
                ))}
              </div>

              {/* Custom Input Field */}
              <div className="flex items-center gap-2 mt-2 pt-2">
                <input
                  type="text"
                  value={customInput}
                  disabled={isProcessing || isResolved}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") executeTurn(customInput);
                  }}
                  placeholder="یا متن دلخواه خود را تایپ کنید و ارسال نمایید..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  disabled={!customInput.trim() || isProcessing || isResolved}
                  onClick={() => executeTurn(customInput)}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Emotional State & EQ Meter */}
        <div className="lg:col-span-4 space-y-4">
          {/* Mood & Chemistry Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>وضعیت هیجانی و نمرات زنده</span>
            </h3>

            {/* Current Partner Mood */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  خلق‌وخوی کنونی پارتنر:
                </div>
                <div className="text-sm font-extrabold text-white mt-0.5">
                  {currentMood}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
            </div>

            {/* EQ Score Progress */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-300">شاخص هوش هیجانی (EQ):</span>
                <span className="text-indigo-400">{eqScore}٪</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${eqScore}%` }}
                />
              </div>
            </div>

            {/* Psychological Safety Meter */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-300">امنیت روانی کلامی:</span>
                <span className="text-emerald-400">{safetyScore}٪</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${safetyScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Rules of Assertive Communication */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>اصول طلایی گفتگوی قاطع و بالغانه:</span>
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>به جای حمله با ضمیر «تو» (تو مقصری)، از ضمیر «من» و حس درونی خود استفاده کنید.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>ابتدا احساس پارتنر را به رسمیت بشناسید (Validation)، سپس مرز خود را شفاف بگویید.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>هرگز هنگام خشم اولتیماتوم یا تهدید به جدایی ندهید.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
