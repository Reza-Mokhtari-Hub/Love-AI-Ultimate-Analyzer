import React from "react";
import {
  History,
  X,
  Trash2,
  ExternalLink,
  RotateCcw,
  Award,
  Calendar,
  Layers,
} from "lucide-react";
import { QuizResult } from "../types";
import { playClickSound, playWarningSound } from "../utils/audio";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: QuizResult[];
  onSelectResult: (result: QuizResult) => void;
  onDeleteResult: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onDeleteResult,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050713]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <History className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
              آرشیو شناسنامه‌ها و آزمون‌های قبلی ({history.length})
            </h2>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs">هنوز هیچ آزمونی در این مرورگر ذخیره نشده است.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div
                  onClick={() => {
                    playClickSound();
                    onSelectResult(item);
                    onClose();
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base ${
                      item.score >= 70
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : item.score >= 50
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {item.score}٪
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {item.dominantAttachmentTitle}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.mode === "full" ? "نسخه جامع" : "نسخه سریع"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-sky-400">{item.realismStatus}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      playClickSound();
                      onSelectResult(item);
                      onClose();
                    }}
                    className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    title="مشاهده کارنامه"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      playWarningSound();
                      if (confirm("آیا مایلید این کارنامه از تاریخچه حذف شود؟")) {
                        onDeleteResult(item.id);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
