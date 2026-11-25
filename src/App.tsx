import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { BackgroundParticles } from "./components/BackgroundParticles";
import { QuizModule } from "./components/QuizModule";
import { ResultDashboard } from "./components/ResultDashboard";
import { ConflictRepairModule } from "./components/ConflictRepairModule";
import { RoleplaySimulatorModule } from "./components/RoleplaySimulatorModule";
import { AttachmentCompassModule } from "./components/AttachmentCompassModule";
import { ValuesAlignmentModule } from "./components/ValuesAlignmentModule";
import { LoveLanguageModule } from "./components/LoveLanguageModule";
import { ToxicRadarModule } from "./components/ToxicRadarModule";
import { ChatForensicsModule } from "./components/ChatForensicsModule";
import { RelationshipTimelineModule } from "./components/RelationshipTimelineModule";
import { CoachChatModule } from "./components/CoachChatModule";
import { WisdomLibraryModule } from "./components/WisdomLibraryModule";
import { HistoryModal } from "./components/HistoryModal";
import { InfoModal } from "./components/InfoModal";
import { QuizResult } from "./types";
import {
  getSavedQuizHistory,
  saveQuizResultToHistory,
  deleteQuizResultFromHistory,
} from "./utils/storage";
import { isAudioEnabled, toggleAudioSound, playClickSound } from "./utils/audio";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("quiz");
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(!isAudioEnabled());
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = getSavedQuizHistory();
    setHistory(saved);
    if (saved.length > 0) {
      setCurrentResult(saved[0]);
    }
  }, []);

  const handleQuizComplete = (res: QuizResult) => {
    setCurrentResult(res);
    const updated = saveQuizResultToHistory(res);
    setHistory(updated);
    setActiveTab("result");
  };

  const handleToggleSound = () => {
    const enabled = toggleAudioSound();
    setIsMuted(!enabled);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteQuizResultFromHistory(id);
    setHistory(updated);
    if (currentResult?.id === id) {
      setCurrentResult(updated[0] || null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050713] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Interactive Ambient Floating Particles */}
      <BackgroundParticles />

      {/* Top Navbar */}
      <Header
        activeTab={activeTab === "result" ? "quiz" : activeTab}
        setActiveTab={(tab) => {
          if (tab === "quiz" && currentResult) {
            setActiveTab("quiz");
          } else {
            setActiveTab(tab);
          }
        }}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenInfo={() => setIsInfoOpen(true)}
        historyCount={history.length}
      />

      {/* Main View Area */}
      <main className="relative z-10 flex-1 pb-16 px-3 sm:px-6 lg:px-8 pt-4">
        {activeTab === "quiz" && (
          <div>
            {currentResult && (
              <div className="max-w-4xl mx-auto px-4 pb-4 flex justify-end">
                <button
                  onClick={() => {
                    playClickSound();
                    setActiveTab("result");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-rose-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md shadow-black/30"
                >
                  <span>نمایش کارنامه آخرین سنجش خلوص ({currentResult.score}٪)</span>
                  <span>←</span>
                </button>
              </div>
            )}
            <QuizModule onComplete={handleQuizComplete} />
          </div>
        )}

        {activeTab === "result" && currentResult && (
          <ResultDashboard
            result={currentResult}
            onRetake={() => {
              playClickSound();
              setActiveTab("quiz");
            }}
            onNavigateToTab={(tab) => {
              playClickSound();
              setActiveTab(tab);
            }}
          />
        )}

        {activeTab === "conflict" && <ConflictRepairModule />}

        {activeTab === "roleplay" && <RoleplaySimulatorModule />}

        {activeTab === "attachment" && <AttachmentCompassModule />}

        {activeTab === "values" && <ValuesAlignmentModule />}

        {activeTab === "lovelang" && <LoveLanguageModule />}

        {activeTab === "toxic" && <ToxicRadarModule />}

        {activeTab === "chat" && <ChatForensicsModule />}

        {activeTab === "timeline" && <RelationshipTimelineModule />}

        {activeTab === "coach" && <CoachChatModule lastResult={currentResult} />}

        {activeTab === "wisdom" && <WisdomLibraryModule />}
      </main>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(res) => {
          setCurrentResult(res);
          setActiveTab("result");
        }}
        onDeleteResult={handleDeleteHistory}
      />

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Bottom Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#070a1a]/90 backdrop-blur-md py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Love AI Analyzer v5.0 Ultimate Pro • توسعه‌یافته با موتور تحلیلی قدرتمند Gemini 3.5 Flash
          </span>
          <span className="text-[11px] text-slate-600">
            طراحی‌شده بر پایه نظریه دلبستگی ECR بالینی، الگوهای ۴ سوار جان گاتمن و روانشناسی ارتباط بدون خشونت (NVC)
          </span>
        </div>
      </footer>
    </div>
  );
}
