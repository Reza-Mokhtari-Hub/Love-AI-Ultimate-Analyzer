import React, { useState } from "react";
import {
  BookOpen,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  X,
  Share2,
  Check,
} from "lucide-react";
import { wisdomArticlesList } from "../data/wisdomArticles";
import { WisdomArticle } from "../types";
import { playClickSound } from "../utils/audio";

export const WisdomLibraryModule: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<WisdomArticle | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleOpen = (art: WisdomArticle) => {
    playClickSound();
    setSelectedArticle(art);
  };

  const handleClose = () => {
    playClickSound();
    setSelectedArticle(null);
  };

  const handleCopy = () => {
    if (!selectedArticle) return;
    playClickSound();
    navigator.clipboard.writeText(`${selectedArticle.title}\n\n${selectedArticle.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 mb-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BookOpen className="w-4 h-4" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            دانشنامه و بانک راهنماهای روانشناسی روابط
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          مجموعه مقالات علمی و بالینی برای ارتقای هوش عاطفی، حل تعارضات و محافظت از سلامت روانی
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wisdomArticlesList.map((article) => (
          <div
            key={article.id}
            onClick={() => handleOpen(article)}
            className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {article.category}
                </span>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                </div>
              </div>

              <h3 className="font-black text-base sm:text-lg text-white mb-2 group-hover:text-amber-300 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {article.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-bold text-amber-400">
              <span>مطالعه کامل راهنما</span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-[#050713]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-1.5 inline-block">
                  {selectedArticle.category} • {selectedArticle.readTime} مطالعه
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {selectedArticle.title}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  title="کپی متن مقاله"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-200 text-xs sm:text-sm leading-loose whitespace-pre-line">
              <p className="font-medium text-slate-300 border-r-2 border-amber-400 pr-3 italic bg-slate-900/50 p-2.5 rounded-l-xl">
                {selectedArticle.summary}
              </p>

              <div>{selectedArticle.content}</div>

              {/* Takeaways */}
              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <h4 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>نکات کلیدی و کاربردی:</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedArticle.takeaways.map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
              >
                بستن راهنما
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
