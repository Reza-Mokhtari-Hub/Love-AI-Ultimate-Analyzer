import React, { useEffect, useRef } from "react";
import { QuizMetrics } from "../types";

interface RadarChartCanvasProps {
  metrics: QuizMetrics;
  size?: number;
}

export const RadarChartCanvas: React.FC<RadarChartCanvasProps> = ({ metrics, size = 380 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;

    const axes = [
      { label: "همدلی و درک عاطفی", value: metrics.empathy },
      { label: "تعهد عملی و ثبات", value: metrics.commitment },
      { label: "صداقت و شفافیت", value: metrics.trust },
      { label: "بلوغ عاطفی", value: metrics.maturity },
      { label: "مدیریت خشم و حل تعارض", value: metrics.conflict },
      { label: "حریم شخصی و استقلال", value: metrics.boundaries },
    ];

    const totalAxes = axes.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw concentric polygon grid
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      const r = (radius / levels) * level;
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = level === levels ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (level === levels) {
        ctx.fillStyle = "rgba(15, 23, 42, 0.3)";
        ctx.fill();
      }
    }

    // Draw axis spokes
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Axis labels
      const labelDistance = radius + 26;
      const labelX = centerX + labelDistance * Math.cos(angle);
      const labelY = centerY + labelDistance * Math.sin(angle);

      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 11px Vazirmatn, sans-serif";

      // Adjust text positioning slightly for top/bottom
      ctx.fillText(axes[i].label, labelX, labelY);

      // Value percentage
      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 10px Vazirmatn, sans-serif";
      ctx.fillText(`${axes[i].value}٪`, labelX, labelY + 14);
    }

    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const val = Math.max(10, Math.min(100, axes[i].value));
      const r = (radius * val) / 100;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Fill gradient
    const fillGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
    fillGrad.addColorStop(0, "rgba(244, 63, 94, 0.55)");
    fillGrad.addColorStop(0.7, "rgba(244, 63, 94, 0.25)");
    fillGrad.addColorStop(1, "rgba(56, 189, 248, 0.15)");
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw dots at vertices
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const val = Math.max(10, Math.min(100, axes[i].value));
      const r = (radius * val) / 100;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#f43f5e";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [metrics, size]);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="max-w-full h-auto drop-shadow-[0_0_20px_rgba(244,63,94,0.2)]"
      />
    </div>
  );
};
