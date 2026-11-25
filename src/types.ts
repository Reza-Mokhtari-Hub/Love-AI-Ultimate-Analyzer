export type DimensionKey =
  | "empathy"
  | "commitment"
  | "trust"
  | "maturity"
  | "conflict"
  | "boundaries";

export type AttachmentStyle =
  | "secure" // امن
  | "anxious" // اضطرابی - وابسته
  | "avoidant" // اجتنابی - گریزپا
  | "disorganized"; // آشفته / هراسان

export interface QuizOption {
  text: string;
  score: number;
  dimension: DimensionKey;
  attachment: AttachmentStyle;
  greenFlag?: string;
  redFlag?: string;
  idealizationRisk?: boolean;
}

export interface QuizQuestion {
  id: number;
  category: string;
  title: string;
  subtext?: string;
  tag: string;
  options: QuizOption[];
}

export interface QuizMetrics {
  empathy: number;
  commitment: number;
  trust: number;
  maturity: number;
  conflict: number;
  boundaries: number;
}

export interface QuizResult {
  id: string;
  date: string;
  mode: "full" | "quick";
  score: number;
  realismStatus: string;
  dominantAttachment: AttachmentStyle;
  dominantAttachmentTitle: string;
  metrics: QuizMetrics;
  greenFlags: string[];
  redFlags: string[];
  aiReport: string;
  userAnswers: { questionId: number; optionIndex: number }[];
}

export type LoveLangKey = "words" | "time" | "gifts" | "acts" | "touch";

export interface LoveLangQuestion {
  id: number;
  title: string;
  scenario: string;
  options: {
    text: string;
    type: LoveLangKey;
  }[];
}

export interface LoveLangResult {
  scores: Record<LoveLangKey, number>;
  primary: LoveLangKey;
  secondary: LoveLangKey;
  description: string;
  actionableTips: string[];
}

export interface ToxicCheckItem {
  id: string;
  title: string;
  category: "manipulation" | "control" | "communication" | "emotional" | "boundary";
  severity: "high" | "critical" | "moderate";
  description: string;
  example: string;
  copingTip: string;
}

export interface TimelinePoint {
  id: string;
  period: string;
  score: number;
  milestone: string;
  note?: string;
  date?: string;
}

export interface ChatForensicsItem {
  id: string;
  title: string;
  stage: string;
  sampleText: string;
}

export interface CoachMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface WisdomArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  iconName: string;
  summary: string;
  content: string;
  takeaways: string[];
}

// ----------------------------------------------------
// New Advanced Module Types (v5.0 Ultimate Pro)
// ----------------------------------------------------

export interface ConflictTriggerOption {
  id: string;
  title: string;
  category: string;
  defaultStatement: string;
  partnerReaction: string;
}

export interface RoleplayScenarioItem {
  id: string;
  title: string;
  shortDesc: string;
  context: string;
  partnerInitialMood: string;
  initialMessage: string;
  presetResponses: {
    label: string;
    text: string;
    style: "assertive" | "defensive" | "passive" | "aggressive";
  }[];
}

export interface RoleplayTurn {
  id: string;
  sender: "user" | "partner" | "system";
  text: string;
  mood?: string;
  eqScore?: number;
  safetyScore?: number;
  coachingTip?: string;
  timestamp: string;
}

export interface ValuePillar {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  myScore: number; // 0 - 100 importance/preference
  partnerScore: number; // 0 - 100 importance/preference
  keyQuestions: string[];
}

export interface ECRAttachmentQuestion {
  id: number;
  text: string;
  dimension: "anxiety" | "avoidance";
  isReverse: boolean; // if true, 5 => low, 1 => high
}

export interface ECRResult {
  anxietyScore: number; // 0 to 100
  avoidanceScore: number; // 0 to 100
  quadrant: "secure" | "anxious" | "avoidant" | "fearful";
  titleFa: string;
  subtitleFa: string;
  explanation: string;
  healingPractices: string[];
  partnerAdvice: string[];
}

