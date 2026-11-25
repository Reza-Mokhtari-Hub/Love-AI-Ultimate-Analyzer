import { QuizResult } from "../types";

export function generatePassportCardImage(result: QuizResult): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // High resolution canvas for crisp text
      const width = 1000;
      const height = 1250;
      canvas.width = width;
      canvas.height = height;

      // Dark background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#070a1e");
      bgGrad.addColorStop(0.5, "#0b0f2a");
      bgGrad.addColorStop(1, "#150b28");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Outer glowing border
      ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Top badge
      ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
      ctx.beginPath();
      ctx.roundRect(60, 50, width - 120, 100, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(244, 63, 94, 0.3)";
      ctx.stroke();

      // Top title
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Vazirmatn, sans-serif";
      ctx.fillText("شناسنامه تحلیل خلوص و رفتارشناسی عاطفی", width / 2, 100);

      ctx.font = "20px Vazirmatn, sans-serif";
      ctx.fillStyle = "#fb7185";
      ctx.fillText("LOVE AI ANALYZER v4.0 ULTIMATE", width / 2, 135);

      // Score big circle
      const centerX = width / 2;
      const centerY = 310;
      const radius = 105;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.strokeStyle = result.score >= 70 ? "#10b981" : result.score >= 50 ? "#f59e0b" : "#f43f5e";
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 64px Vazirmatn, sans-serif";
      ctx.fillText(`${result.score}٪`, centerX, centerY + 18);

      ctx.font = "bold 20px Vazirmatn, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("شاخص خلوص عاطفی", centerX, centerY + 52);

      // Attachment style badge
      ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
      ctx.beginPath();
      ctx.roundRect(centerX - 190, 440, 380, 55, 28);
      ctx.fill();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 22px Vazirmatn, sans-serif";
      ctx.fillText(`سبک دلبستگی: ${result.dominantAttachmentTitle}`, centerX, 475);

      // 6 Dimensions Metrics Bars
      const startY = 540;
      const barHeight = 22;
      const metricsList = [
        { label: "همدلی و درک عاطفی", value: result.metrics.empathy, color: "#f43f5e" },
        { label: "تعهد عملی و ثبات", value: result.metrics.commitment, color: "#38bdf8" },
        { label: "صداقت و اعتماد متقابل", value: result.metrics.trust, color: "#10b981" },
        { label: "بلوغ عاطفی و خودتنظیمی", value: result.metrics.maturity, color: "#a855f7" },
        { label: "حل تعارض و مدیریت خشم", value: result.metrics.conflict, color: "#f59e0b" },
        { label: "حریم شخصی و استقلال", value: result.metrics.boundaries, color: "#ec4899" },
      ];

      metricsList.forEach((m, idx) => {
        const y = startY + idx * 62;
        ctx.textAlign = "right";
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 20px Vazirmatn, sans-serif";
        ctx.fillText(m.label, width - 100, y + 16);

        ctx.textAlign = "left";
        ctx.fillStyle = m.color;
        ctx.fillText(`${m.value}٪`, 100, y + 16);

        // Bar background
        const barStartX = 200;
        const barWidth = width - 300 - 180;
        ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
        ctx.beginPath();
        ctx.roundRect(barStartX, y, barWidth, barHeight, 10);
        ctx.fill();

        // Bar filled
        const filledWidth = Math.max(15, (m.value / 100) * barWidth);
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.roundRect(barStartX, y, filledWidth, barHeight, 10);
        ctx.fill();
      });

      // Flags section
      const flagsY = 940;
      ctx.fillStyle = "rgba(16, 185, 129, 0.1)";
      ctx.beginPath();
      ctx.roundRect(70, flagsY, width / 2 - 90, 160, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
      ctx.stroke();

      ctx.fillStyle = "rgba(244, 63, 94, 0.1)";
      ctx.beginPath();
      ctx.roundRect(width / 2 + 20, flagsY, width / 2 - 90, 160, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(244, 63, 94, 0.3)";
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 22px Vazirmatn, sans-serif";
      ctx.fillText("✅ پرچم‌های سبز شاخص", width / 4 + 25, flagsY + 40);

      ctx.fillStyle = "#f87171";
      ctx.fillText("⚠️ هشدارهای رفتاری", (3 * width) / 4 - 25, flagsY + 40);

      ctx.font = "17px Vazirmatn, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      const greenText = result.greenFlags.slice(0, 2).join(" • ") || "ثبات و رفتار رضایت‌بخش";
      const redText = result.redFlags.slice(0, 2).join(" • ") || "مورد حادی شناسایی نشد";

      wrapCanvasText(ctx, greenText, width / 4 + 25, flagsY + 80, width / 2 - 130, 26);
      wrapCanvasText(ctx, redText, (3 * width) / 4 - 25, flagsY + 80, width / 2 - 130, 26);

      // Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "16px Vazirmatn, sans-serif";
      ctx.fillText(`تاریخ ارزیابی: ${result.date} | نسخه هوشمند ۴.۰`, width / 2, height - 55);

      resolve(canvas.toDataURL("image/png"));
    } catch (err) {
      reject(err);
    }
  });
}

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + " ";
      currentY += lineHeight;
      if (currentY > y + 60) break; // limit lines
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
