import { QuizResult, TimelinePoint } from "../types";

const HISTORY_KEY = "loveai_quiz_history_v4";
const TIMELINE_KEY = "loveai_timeline_points_v4";
const LOVE_LANG_KEY = "loveai_lovelang_saved_v4";

export function getSavedQuizHistory(): QuizResult[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveQuizResultToHistory(result: QuizResult): QuizResult[] {
  try {
    const history = getSavedQuizHistory();
    const updated = [result, ...history.filter((r) => r.id !== result.id)].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteQuizResultFromHistory(id: string): QuizResult[] {
  try {
    const history = getSavedQuizHistory();
    const updated = history.filter((r) => r.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getSavedTimelinePoints(): TimelinePoint[] {
  try {
    const data = localStorage.getItem(TIMELINE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // fallback
  }
  return [
    { id: "1", period: "ماه اول (آشنایی)", score: 92, milestone: "شروع صمیمیت و هیجان اولیه", date: "آغاز مسیر" },
    { id: "2", period: "ماه سوم (اولین تنش)", score: 76, milestone: "حل اولین چالش و گفتگو درباره مرزها", date: "۳ ماه بعد" },
    { id: "3", period: "ماه ششم (تثبیت)", score: 85, milestone: "آشنایی با دوستان و هماهنگی رفتاری", date: "۶ ماه بعد" },
    { id: "4", period: "یک سالگی (تعهد)", score: 89, milestone: "برنامه‌ریزی آینده و ثبات دوطرفه", date: "۱ سال بعد" },
  ];
}

export function saveTimelinePoints(points: TimelinePoint[]) {
  try {
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(points));
  } catch {
    // ignore
  }
}

export function getSavedLoveLang() {
  try {
    const data = localStorage.getItem(LOVE_LANG_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveLoveLang(data: any) {
  try {
    localStorage.setItem(LOVE_LANG_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}
