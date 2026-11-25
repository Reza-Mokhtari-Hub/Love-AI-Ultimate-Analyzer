import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy initializer for Google GenAI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Generate in-depth psychological analysis for the Quiz
app.post("/api/analyze-quiz", async (req, res) => {
  try {
    const { score, metrics, attachment, realismStatus, summaryAnswers, redFlags, greenFlags } = req.body;

    const systemInstruction = `تو یک روانشناس ارشد، زوج‌درمانگر و متخصص برجسته رفتارشناسی روابط عاطفی با رویکرد تحلیلی-شناختی (CBT) و نظریه دلبستگی (Attachment Theory) هستی.
وظیفه تو تحلیل عمیق، منصفانه، دلسوزانه و فوق‌العاده علمی و کاربردی نتایج آزمون سنجش خلوص و رفتارشناسی کاربر است.
متن خروجی باید کاملاً به زبان فارسی روان، جذاب، با ساختاردهی زیبا، استفاده از ایموجی‌های مرتبط و لحنی همدلانه و تخصصی باشد.

گزارش را در ۵ بخش شفاف و ساختاریافته ارائه کن:
۱. 🔬 **کالبدشکافی لایه‌ای خلوص عاطفی و اصالت رابطه:** تحلیل کلی نمره (${score}٪)، سطح صداقت و بلوغ رفتاری، و واقع‌گرایی رابطه.
۲. 🧬 **تحلیل سبک دلبستگی (${attachment}):** توضیح الگوهای ناخودآگاه، محرک‌های اضطراب یا اجتناب، و نحوه واکنش در لحظات صمیمیت و تنش.
۳. 🛡️ **ماتریس نقاط قوت و پرچم‌های سبز (Green Flags):** رفتارهای سازنده و نشانه‌های تعهد اصیل طرفین.
۴. ⚠️ **رادار پرچم‌های قرمز و هشدارهای رفتاری (Red Flags):** ریسک‌های بالقوه، احتمال رفتارهای دستکاری‌کننده (مانند Gaslighting، Love Bombing، یا Stonewalling در صورت وجود).
۵. 💡 **نقشه راه عملیاتی، پروتکل گفتگو و توصیه‌های زوج‌درمانی:** ۳ تا ۴ راهکار کاملاً عملی، جملات کلیدی برای گفتگوهای سخت و تعیین مرزهای سالم.`;

    const userPrompt = `داده‌های سنجش عاطفی کاربر:
- نمره کل شاخص خلوص: ${score}٪
- شاخص اصالت و واقع‌بینی پاسخ‌ها: ${realismStatus}
- سبک دلبستگی غالب شناسایی‌شده: ${attachment}
- ابعاد ۶گانه روانشناسی:
  * همدلی و درک عاطفی: ${metrics?.empathy ?? 70}٪
  * تعهد عملی و ثبات: ${metrics?.commitment ?? 70}٪
  * صداقت، شفافیت و اعتماد: ${metrics?.trust ?? 70}٪
  * بلوغ عاطفی و خودتنظیمی: ${metrics?.maturity ?? 70}٪
  * حل تعارض و مدیریت خشم: ${metrics?.conflict ?? 70}٪
  * حریم شخصی و استقلال متقابل: ${metrics?.boundaries ?? 70}٪
- پرچم‌های سبز ثبت شده: ${greenFlags?.join("، ") || "پایداری عمومی"}
- پرچم‌های قرمز ثبت شده: ${redFlags?.join("، ") || "مورد حادی ثبت نشد"}

خلاصه سناریوهای منتخب کاربر:
${summaryAnswers || "پاسخ‌ها در ابعاد مختلف ثبت شدند."}

لطفاً گزارش تخصصی و جامع را با بخش‌های خواسته شده تنظیم کن.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const report = response.text || "تحلیل تخصصی با موفقیت تولید شد.";
    res.json({ success: true, report });
  } catch (error: any) {
    console.error("Error in /api/analyze-quiz:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "خطا در پردازش تحلیل هوش مصنوعی",
    });
  }
});

// API: Deconstruct custom text, chat logs, or situation
app.post("/api/analyze-chat", async (req, res) => {
  try {
    const { text, contextType, relationshipStage } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "لطفاً متن کامل‌تری (حداقل دو جمله) وارد کنید.",
      });
    }

    const systemInstruction = `تو یک کارشناس خبره رفتارشناسی زبانی، روانشناس پیام و تحلیلگر روابط عاطفی هستی.
کاربر یک پیام چت، یک مکالمه واقعی، یا شرح یک اتفاق عاطفی را برایت فرستاده است.
هدف تو کالبدشکافی موشکافانه، کشف ساب‌تکست‌ها (Subtext) و انگیزه‌های ناخودآگاه، و ارائه راهنمای عمل است.

پاسخ را در ۵ بخش کاربردی و جذاب به زبان فارسی بنویس:
۱. 🔍 **نیت واقعی و زیرمتن پیام (Subtext & Intent):** پشت این کلمات واقعاً چه حسی یا خواسته‌ای پنهان است؟
۲. 🚩 **تشخیص رفتارهای دستکاری‌کننده و نشانه‌های سمی:** آیا نشانه‌هایی از Gaslighting (وارونه‌نمایی)، Guilt Tripping (حس گناه دادن)، Love Bombing، Stonewalling (دیوار کشیدن)، یا Breadcrumbing (قطره‌چکانی) وجود دارد؟
۳. 🧬 **سبک دلبستگی و الگوی هیجانی گوینده:** (امن، اضطرابی، اجتنابی، یا خودشیفته/مرزی).
۴. 💬 **نمونه پاسخ‌های هوشمندانه و بازدارنده (Suggested Replies):** ۲ مدل پاسخ پیشنهادی:
   - پاسخ الف: دیپلماتیک، بالغانه و شفاف
   - پاسخ ب: قاطع، مرزبند و پیشگیرانه
۵. 🧠 **درس روانشناسی و توصیه محوری:** چه درسی باید برای تعاملات بعدی بگیرید؟`;

    const userPrompt = `مرحله رابطه: ${relationshipStage || "نامشخص"}
نوع محتوا: ${contextType || "متن پیام/مکالمه"}
متن ورودی کاربر جهت کالبدشکافی:
"""
${text}
"""`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const analysis = response.text || "تحلیل پیام انجام شد.";
    res.json({ success: true, analysis });
  } catch (error: any) {
    console.error("Error in /api/analyze-chat:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "خطا در برقراری ارتباط با مدل هوش مصنوعی",
    });
  }
});

// API: Relationship Coach Chat
app.post("/api/coach-chat", async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: "پیامی ارسال نشده است." });
    }

    const systemInstruction = `تو "مربی هوشمند و امین روابط عاطفی" (LoveAI Coach) هستی؛ یک مشاور و روانشناس بالینی مجرب، رازدار، صمیمی و در عین حال علمی.
رویکرد تو مبتنی بر روانشناسی مثبت‌نگر، الگوهای ارتباط بدون خشونت (NVC) و اصول جان گاتمن (John Gottman) است.
پاسخ‌هایت باید کوتاه، کاربردی، بدون کلی‌گویی و با راهکارهای گام‌به‌گام و ملموس باشد.
از عبارات فارسی گرم و پرانرژی استفاده کن و احساسات کاربر را به رسمیت بشناس.

پیشینه آزمون کاربر (در صورت موجود بودن):
${JSON.stringify(userContext || {})}`;

    // Convert messages for chat
    const formattedHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "پاسخی از مربی دریافت نشد.";
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error("Error in /api/coach-chat:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "خطا در ارتباط با مربی هوشمند",
    });
  }
});

// API: Couple Compatibility & Love Languages Match
app.post("/api/compatibility-check", async (req, res) => {
  try {
    const { myLoveLangs, partnerLoveLangs, duration, coreChallenge } = req.body;

    const systemInstruction = `تو متخصص تحلیل سازگاری زوجین و زبان‌های عشق ۵گانه چاپمن هستی.
کاربر مشخصات زبان‌های عشق خود و پارتنرش را فرستاده است.
یک تحلیل سازگاری، نقاط اتصال عاطفی، نقاط کور احتمالی (Blindspots) و راهنمای هماهنگی دونفره به زبان فارسی ارائه کن.`;

    const userPrompt = `اطلاعات زوج:
- مدت آشنایی/رابطه: ${duration || "نامشخص"}
- زبان‌های عشق من (به ترتیب اولویت): ${JSON.stringify(myLoveLangs || {})}
- زبان‌های عشق پارتنر (به ترتیب اولویت): ${JSON.stringify(partnerLoveLangs || {})}
- چالش یا دغدغه اصلی: ${coreChallenge || "بهبود کیفیت پیوند عاطفی"}

لطفاً تحلیل سازگاری، درصد همپوشانی تقریبی، تفاوت‌های کلیدی در نحوه ابراز محبت، و ۳ تمرین دونفره ساده ارائه بده.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ success: true, report: response.text || "تحلیل سازگاری تولید شد." });
  } catch (error: any) {
    console.error("Error in /api/compatibility-check:", error);
    res.status(500).json({ success: false, error: error?.message || "خطا در پردازش سازگاری" });
  }
});

// API: Gottman 4-Horsemen & NVC Conflict De-escalator
app.post("/api/conflict-deescalate", async (req, res) => {
  try {
    const { trigger, rawStatement, partnerReaction, conflictFrequency } = req.body;

    const systemInstruction = `تو متخصص ارشد حل تعارضات زوجین و مربی ارتباط بدون خشونت (NVC - Nonviolent Communication) بر پایه متد جان گاتمن هستی.
کاربر یک موضوع مشاجره یا جمله‌ای که در بحث رد و بدل شده را مطرح کرده است.
وظیفه تو:
۱. 🐴 **تشخیص ۴ سوار ویرانگر گاتمن (Four Horsemen):** بررسی وجود انتقاد تند (Criticism)، تحقیر/طعنه (Contempt)، حالت تدافعی (Defensiveness) یا قهر خاموش (Stonewalling) در این موقعیت.
۲. 🛡️ **پادزهر فوری (Antidote):** جایگزینی واکنش‌های مخرب با شروع نرم (Soft Startup) و مسئولیت‌پذیری.
۳. 📝 **بازنویسی به زبان NVC (فرمول ۴ مرحله‌ای):**
   - ۱. مشاهده عینی بدون قضاوت (Observation)
   - ۲. بیان احساس واقعی (Feeling)
   - ۳. نیاز برآورده‌نشده (Need)
   - ۴. درخواست مشخص، شفاف و قابل اجرا (Request)
۴. 🗣️ **نمونه جمله آماده برای شروع گفتگو:** ۲ جمله دقیق که کاربر می‌تواند مستقیماً به زبان بیاورد یا پیامک کند.
۵. 🧠 **تمرین ذهنی برای کنترل طغیان عاطفی (Flooding Management):** راهکار آرام‌سازی سریع در صورت داغ شدن بحث.

پاسخ را بسیار کاربردی، سازمان‌یافته، بدون کلی‌گویی و به زبان فارسی شیوا ارائه بده.`;

    const userPrompt = `داده‌های تعارض:
- موضوع/جرقه‌زننده بحث: ${trigger || "نامشخص"}
- جمله یا رفتار رخ‌داده: "${rawStatement || "بحث و دلخوری عمومی"}"
- واکنش یا برخورد پارتنر: "${partnerReaction || "سکوت یا تدافع"}"
- تکرار این تعارض: ${conflictFrequency || "گاهی"}

لطفاً کالبدشکافی تعارض و فرمول بازنویسی NVC را تولید کن.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({ success: true, analysis: response.text || "تحلیل تعارض انجام شد." });
  } catch (error: any) {
    console.error("Error in /api/conflict-deescalate:", error);
    res.status(500).json({ success: false, error: error?.message || "خطا در پردازش تحلیل تعارض" });
  }
});

// API: Interactive Scenario Roleplay Engine
app.post("/api/roleplay-step", async (req, res) => {
  try {
    const { scenarioTitle, scenarioDescription, conversationHistory, userActionOrText } = req.body;

    const systemInstruction = `تو در حال شبیه‌سازی یک پارتنر واقعی در یک سناریوی عاطفی پرچالش هستی.
همچنین در کنار بازی نقش پارتنر، در بخش دوم پاسخ، به عنوان یک روانشناس و ناظر هوشمند عاطفی، عملکرد کاربر را تحلیل می‌کنی.

فرمت خروجی تو باید حتماً به صورت یک شیء JSON معتبر با این ساختار باشد:
{
  "partnerReply": "پاسخ طبیعی، باورپذیر و احساسی پارتنر به زبان فارسی عامیانه و روان",
  "partnerMood": "یکی از موارد: تدافعی | آرام‌شده | مضطرب | پذیرا و همدل | عصبانی | دلگرم",
  "eqScore": عدد بین 1 تا 100 که نشان‌دهنده هوش هیجانی پاسخ کاربر است,
  "psychologicalSafety": عدد بین 1 تا 100 نشان‌دهنده احساس امنیت روانی ایجادشده,
  "coachingTip": "تحلیل کوتاه ۱ تا ۲ جمله‌ای روانشناختی درباره نقاط قوت یا ضعف حرف کاربر",
  "isResolved": بولین (true اگر تعارض به خوبی و با درک متقابل خاتمه یافته، false اگر ادامه دارد)
}

نکته مهم: خروجی باید صرفاً یک JSON معتبر باشد بدون تگ‌های اضافی غیر از کدبلاک json.`;

    const userPrompt = `سناریو: ${scenarioTitle}
شرح سناریو: ${scenarioDescription}

تاریخچه مکالمه تاکنون:
${JSON.stringify(conversationHistory || [])}

پاسخ/اقدام اخیر کاربر:
"${userActionOrText}"

لطفاً پاسخ پارتنر و تحلیل روانشناختی را در قالب JSON خواسته شده ارائه بده.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "{}";
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        partnerReply: "متوجهم... اما باید بتونیم با آرامش بیشتری در موردش حرف بزنیم.",
        partnerMood: "پذیرا و همدل",
        eqScore: 80,
        psychologicalSafety: 75,
        coachingTip: "پاسخ مناسبی بود که فضا را برای ادامه گفتگوی امن باز کرد.",
        isResolved: false,
      };
    }

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/roleplay-step:", error);
    res.status(500).json({ success: false, error: error?.message || "خطا در اجرای شبیه‌ساز سناریو" });
  }
});

// API: Values & Long-term Alignment Deep Analysis
app.post("/api/values-alignment", async (req, res) => {
  try {
    const { values, overallScore, relationshipGoal, highGaps, strongSynergies } = req.body;

    const systemInstruction = `تو متخصص برجسته مشاوره پیش از ازدواج و ارزیابی سازگاری بلندمدت ارزش‌های فردی زوجین هستی.
کاربر داده‌های مقایسه‌ای ۸ ستون ارزش‌های محوری خود و پارتنرش را ارسال کرده است.
یک ارزیابی عمیق، بی‌طرفانه، راهبردی و امیدبخش به زبان فارسی بنویس.

ساختار پاسخ:
۱. 💎 **ارزیابی کلان پایداری و شاخص هم‌راستایی (${overallScore}٪):** تحلیل بلوغ زوج در پیشبرد اهداف مشترک.
۲. 🌟 **ارکان هم‌افزا و ستون‌های طلایی رابطه (Core Synergies):** نقاط قوتی که رابطه را در طوفان‌ها سرپا نگه می‌دارند.
۳. ⚡ **مناطق پرخطر و نقاط اصطکاک بالقوه (Friction Zones):** تفاوت‌هایی که اگر صریح مطرح نشوند تبدیل به کینه می‌شوند.
۴. ❓ **۵ سوال حیاتی قبل از تعهد نهایی (The 5 Crucial Conversations):** پرسش‌هایی صریح درباره پول، خانواده، استقلال و سبک زندگی.
۵. 📜 **توصیه راهبردی و عهدنامه تعهد:** جمع‌بندی روانشناختی.`;

    const userPrompt = `هدف رابطه: ${relationshipGoal || "ازدواج و زندگی مشترک بلندمدت"}
شاخص کلی هم‌راستایی ارزش‌ها: ${overallScore}٪
بزرگ‌ترین شکاف‌ها و تفاوت‌ها: ${highGaps?.join("، ") || "شکاف عمده‌ای مشاهده نشد"}
بزرگ‌ترین نقاط اشتراک: ${strongSynergies?.join("، ") || "اشتراک در اکثر محورها"}

جزئیات ۸ بعد ارزش‌ها:
${JSON.stringify(values || {})}

لطفاً گزارش تحلیلی عمیق را با تیترهای جذاب آماده کن.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.65,
      },
    });

    res.json({ success: true, report: response.text || "تحلیل سازگاری ارزش‌ها انجام شد." });
  } catch (error: any) {
    console.error("Error in /api/values-alignment:", error);
    res.status(500).json({ success: false, error: error?.message || "خطا در تحلیل ارزش‌ها" });
  }
});

// API: Adult Attachment Compass (ECR) In-depth Healing Report
app.post("/api/attachment-deep-analysis", async (req, res) => {
  try {
    const { anxietyScore, avoidanceScore, quadrantTitle, topTriggers } = req.body;

    const systemInstruction = `تو متخصص عصب‌روانشناسی بالینی، نظریه دلبستگی جان بالبی و مری اینسورث، و تکنیک‌های ترمیم تروما و سبک‌های دلبستگی هستی.
کاربر نمرات دو محوری اضطراب عاطفی و اجتناب از صمیمیت خود را در چارچوب استاندارد ECR (Experiences in Close Relationships) ارسال کرده است.

گزارش تحلیلی را در ۵ بخش عمیق به زبان فارسی ارائه بده:
۱. 🧭 **نقشه جایگاه در قطب‌نمای دلبستگی (${quadrantTitle}):** مختصات اضطراب (${anxietyScore}٪) و اجتناب (${avoidanceScore}٪) و معنای ناخودآگاه آن.
۲. ⚡ **محرک‌های عاطفی اولیه و زخم‌های کهنه (Core Attachment Wounds):** چه اتفاقاتی باعث احساس خطر یا خفگی در رابطه می‌شوند؟
۳. 🔄 **الگوی واکنش در بحران (Fight, Flight, Freeze or Fawn):** هنگام دعوا یا فاصله چه واکنشی نشان می‌دهید؟
۴. 🌿 **برنامه اختصاصی بازسیم‌کشی عصبی و حرکت به سوی دلبستگی امن (Earned Security):** ۴ تمرین شناختی و رفتاری روزمره.
۵. 💬 **کدهای گفتگوی امن با پارتنر:** چطور نیاز عاطفی خود را بدون پرخاش یا عقب‌نشینی به پارتنر بگویید؟`;

    const userPrompt = `سبک شناسایی‌شده: ${quadrantTitle}
نمره محور اضطراب عاطفی (Anxiety): ${anxietyScore}٪
نمره محور اجتناب از صمیمیت (Avoidance): ${avoidanceScore}٪
محرک‌های پررنگ کاربر: ${topTriggers?.join("، ") || "حساسیت به طرد یا مداخله"}

لطفاً نقشه راه و راهنمای ترمیم دلبستگی را تولید کن.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.65,
      },
    });

    res.json({ success: true, report: response.text || "گزارش ترمیم دلبستگی آماده شد." });
  } catch (error: any) {
    console.error("Error in /api/attachment-deep-analysis:", error);
    res.status(500).json({ success: false, error: error?.message || "خطا در تحلیل دلبستگی" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
