import React from "react";
import { Info, X, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { playClickSound } from "../utils/audio";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050713]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Info className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
              متدولوژی علمی و راهنمای ابعاد سنجش Love AI
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

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-200 text-xs sm:text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="font-bold text-white mb-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>مبانی روانشناختی سامانه</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              این پلتفرم بر پایه ۳ نظریه معتبر بالینی طراحی شده است:
              <br />
              ۱. <strong>نظریه دلبستگی (Attachment Theory):</strong> بررسی الگوهای امن، اضطرابی و اجتنابی.
              <br />
              ۲. <strong>الگوهای پیش‌بینی طلاق جان گاتمن (Gottman Institute):</strong> شناسایی نشانه‌های مسمومیت و ۴ سوار ویرانگر.
              <br />
              ۳. <strong>پنج زبان عشق گری چاپمن:</strong> درک نحوه ابراز و دریافت محبت.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm">ابعاد ۶گانه ارزیابی:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-rose-400 block mb-1">۱. همدلی و درک عاطفی:</strong>
                توانایی شنیدن بدون قضاوت و اعتبار بخشیدن به احساسات طرف مقابل.
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-sky-400 block mb-1">۲. تعهد عملی و ثبات:</strong>
                تطابق حرف و عمل، حضور در روزهای سخت و برنامه‌ریزی آینده.
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-emerald-400 block mb-1">۳. صداقت و شفافیت:</strong>
                یکرنگی رفتاری، قابلیت پیش‌بینی و نبود نقاط تاریک مرموز.
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-purple-400 block mb-1">۴. بلوغ عاطفی و خودتنظیمی:</strong>
                عدم فرافکنی استرس‌های شخصی، شجاعت عذرخواهی و مسئولیت‌پذیری.
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-amber-400 block mb-1">۵. حل تعارض و مهار خشم:</strong>
                پرهیز از توهین و قطع ناگهانی ارتباط در اوج مشاجره.
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <strong className="text-pink-400 block mb-1">۶. حریم شخصی و استقلال:</strong>
                احترام به «نه» پارتنر، عدم تلاش برای ایزوله‌سازی اجتماعی.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>حریم خصوصی ۱۰۰٪ امن:</strong> تمام پاسخ‌ها به صورت محلی در حافظه مرورگر شما نگهداری می‌شوند و هیچ پیام یا تستی بدون اجازه ذخیره ابری نمی‌گردد.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};
