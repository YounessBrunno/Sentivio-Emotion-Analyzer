import { Gauge, Layers3, Sparkles } from "lucide-react";
import type { EmotionPhase } from "../types";

type EmotionMetricsProps = {
  phases: EmotionPhase[];
};

function dominantAcrossPhases(phases: EmotionPhase[]) {
  if (phases.length === 0) return "—";

  const counts: Record<string, number> = {};
  for (const phase of phases) {
    const span = phase.end_frame - phase.start_frame + 1;
    counts[phase.dominant_emotion] = (counts[phase.dominant_emotion] ?? 0) + span;
  }

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

function avgConfidence(phases: EmotionPhase[]) {
  if (phases.length === 0) return "—";

  const sum = phases.reduce((total, phase) => total + phase.average_confidence, 0);
  return `${Math.round((sum / phases.length) * 100)}%`;
}

export default function EmotionMetrics({ phases }: EmotionMetricsProps) {
  const items = [
    {
      label: "Dominant emotion",
      value: dominantAcrossPhases(phases),
      detail: "Most present across the video",
      icon: Sparkles,
      iconClassName: "bg-violet-100 text-violet-700",
    },
    {
      label: "Phases detected",
      value: String(phases.length),
      detail: "Distinct emotional segments",
      icon: Layers3,
      iconClassName: "bg-sky-100 text-sky-700",
    },
    {
      label: "Average confidence",
      value: avgConfidence(phases),
      detail: "Mean detection confidence",
      icon: Gauge,
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <section
          key={item.label}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.4)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-3 font-space text-3xl font-semibold tracking-tight capitalize text-slate-950">
                {item.value}
              </p>
            </div>
            <span className={`grid size-10 place-items-center rounded-2xl ${item.iconClassName}`}>
              <item.icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-400">{item.detail}</p>
        </section>
      ))}
    </div>
  );
}
