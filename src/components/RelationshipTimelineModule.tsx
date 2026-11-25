import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Sparkles,
  Calendar,
  Award,
} from "lucide-react";
import { TimelinePoint } from "../types";
import { getSavedTimelinePoints, saveTimelinePoints } from "../utils/storage";
import { playClickSound, playSuccessSound, playWarningSound } from "../utils/audio";

export const RelationshipTimelineModule: React.FC = () => {
  const [points, setPoints] = useState<TimelinePoint[]>([]);
  const [newPeriod, setNewPeriod] = useState("");
  const [newScore, setNewScore] = useState<number>(85);
  const [newMilestone, setNewMilestone] = useState("");
  const [newDate, setNewDate] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setPoints(getSavedTimelinePoints());
  }, []);

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriod.trim() || !newMilestone.trim()) return;

    playClickSound();
    const newPt: TimelinePoint = {
      id: "pt-" + Date.now(),
      period: newPeriod,
      score: Number(newScore),
      milestone: newMilestone,
      date: newDate || "اخیراً",
    };

    const updated = [...points, newPt];
    setPoints(updated);
    saveTimelinePoints(updated);

    setNewPeriod("");
    setNewMilestone("");
    setNewDate("");
    playSuccessSound();
  };

  const handleDelete = (id: string) => {
    playWarningSound();
    const updated = points.filter((p) => p.id !== id);
    setPoints(updated);
    saveTimelinePoints(updated);
  };

  const handleResetDefault = () => {
    playClickSound();
    const defaults = [
      { id: "1", period: "ماه اول (آشنایی)", score: 92, milestone: "شروع صمیمیت و هیجان اولیه", date: "آغاز" },
      { id: "2", period: "ماه سوم (اولین تنش)", score: 72, milestone: "حل اولین چالش و گفتگو درباره مرزها", date: "۳ ماه بعد" },
      { id: "3", period: "ماه ششم (تثبیت)", score: 86, milestone: "آشنایی با دوستان و هماهنگی رفتاری", date: "۶ ماه بعد" },
      { id: "4", period: "یک سالگی (تعهد)", score: 90, milestone: "برنامه‌ریزی آینده و ثبات دوطرفه", date: "۱ سال بعد" },
    ];
    setPoints(defaults);
    saveTimelinePoints(defaults);
  };

  // Draw Smooth Curve on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 2;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 700) * dpr;
    const height = (canvas.height = 240) * dpr;
    ctx.scale(dpr, dpr);

    const actualWidth = width / dpr;
    const actualHeight = height / dpr;

    ctx.clearRect(0, 0, actualWidth, actualHeight);

    const paddingX = 50;
    const paddingY = 40;
    const plotWidth = actualWidth - paddingX * 2;
    const plotHeight = actualHeight - paddingY * 2;

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = paddingY + (plotHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(actualWidth - paddingX, y);
      ctx.stroke();

      ctx.direction = "ltr";
      ctx.fillStyle = "#64748b";
      ctx.font = "10px Vazirmatn, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${100 - i * 25}٪`, paddingX - 10, y + 3);
    }

    if (points.length === 1) {
      // Just one point
      const x = actualWidth / 2;
      const y = paddingY + plotHeight * (1 - points[0].score / 100);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#f43f5e";
      ctx.fill();
      return;
    }

    // Compute coordinates
    const coords = points.map((p, idx) => {
      const x = paddingX + (plotWidth / (points.length - 1)) * idx;
      const y = paddingY + plotHeight * (1 - p.score / 100);
      return { x, y, point: p };
    });

    // Draw Smooth Bézier Curve
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);

    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(cpX, p0.y, cpX, p1.y, p1.x, p1.y);
    }

    // Line style
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 3.5;
    ctx.shadowColor = "rgba(244, 63, 94, 0.5)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Fill area under curve
    ctx.lineTo(coords[coords.length - 1].x, actualHeight - paddingY);
    ctx.lineTo(coords[0].x, actualHeight - paddingY);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, paddingY, 0, actualHeight - paddingY);
    fillGrad.addColorStop(0, "rgba(244, 63, 94, 0.25)");
    fillGrad.addColorStop(1, "rgba(244, 63, 94, 0.0)");
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Draw points & labels
    coords.forEach((c) => {
      // Circle
      ctx.beginPath();
      ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Score text
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 11px Vazirmatn, sans-serif";
      ctx.fillText(`${c.point.score}٪`, c.x, c.y - 12);

      // Period text below
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 10px Vazirmatn, sans-serif";
      ctx.fillText(c.point.period, c.x, actualHeight - paddingY + 18);
    });
  }, [points]);

  // Average score & trend
  const avgScore = points.length
    ? Math.round(points.reduce((a, b) => a + b.score, 0) / points.length)
    : 0;

  const isUpward =
    points.length >= 2 && points[points.length - 1].score >= points[0].score;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 mb-6 shadow-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Activity className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                گاهشمار و ردیاب پویای نوسانات رابطه
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              ثبت مقاطع بحرانی، صعودها و فرودهای عاطفی، و پایش منحنی سلامت در بستر زمان
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">شاخص پایداری</span>
              <span className="text-xl font-black text-emerald-400">{avgScore}٪</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">جهت منحنی</span>
              <div className="flex items-center gap-1 text-xs font-extrabold text-white mt-1">
                {isUpward ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">رو به رشد</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-400">نیازمند بازبینی</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Graph */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-900 overflow-x-auto">
          <canvas ref={canvasRef} className="w-full h-56 block" />
        </div>
      </div>

      {/* Add New Milestone Point & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form to Add Point */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 shadow-xl border border-slate-800">
          <h3 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>ثبت مقطع یا نقطه عطف جدید</span>
          </h3>

          <form onSubmit={handleAddPoint} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                عنوان مقطع زمانی:
              </label>
              <input
                type="text"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                placeholder="مثلاً: ماه دوم، اولین سفر، معرفی به خانواده"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1 flex items-center justify-between">
                <span>نمره رضایت و خلوص در این مقطع:</span>
                <span className="text-emerald-400 font-extrabold">{newScore}٪</span>
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                شرح رخداد و دستاورد/چالش:
              </label>
              <input
                type="text"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="مثلاً: گفتگوی صریح و حل اولین سوءتفاهم بزرگ"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                تاریخ یا زمان تقریبی (اختیاری):
              </label>
              <input
                type="text"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="مثلاً: پاییز ۱۴۰۲"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن به نمودار گاهشمار</span>
            </button>
          </form>
        </div>

        {/* Milestone Cards List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>فهرست مقاطع ثبت‌شده ({points.length})</span>
            </h3>

            <button
              onClick={handleResetDefault}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>بازیابی پیش‌فرض</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {points.map((pt, idx) => (
              <div
                key={pt.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-slate-300 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{pt.period}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/25">
                        {pt.score}٪
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{pt.milestone}</p>
                    {pt.date && (
                      <span className="text-[10px] text-slate-500">{pt.date}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(pt.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
