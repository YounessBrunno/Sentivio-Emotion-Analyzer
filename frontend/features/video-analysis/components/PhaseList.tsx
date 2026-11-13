import { ArrowRight } from "lucide-react";
import type { EmotionPhase } from "../types";

type PhaseListProps = {
  phases: EmotionPhase[];
};

export default function PhaseList({ phases }: PhaseListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.4)] sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-space text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Timeline</p>
          <h2 className="mt-1 font-space text-xl font-semibold tracking-tight text-slate-950">Detected emotion phases</h2>
          <p className="mt-1 text-sm text-slate-500">Ordered segments from the start to the end of your video.</p>
        </div>
        <p className="text-sm font-medium text-slate-400">{phases.length} total</p>
      </div>

      <ol className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {phases.map((phase, index) => (
          <li
            key={phase.phase_index}
            className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:border-violet-200 hover:bg-violet-50/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-xs font-semibold text-violet-700 ring-1 ring-slate-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-space text-base font-semibold capitalize text-slate-900">{phase.dominant_emotion}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Frames {phase.start_frame}&ndash;{phase.end_frame}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-violet-700">
                {Math.round(phase.average_confidence * 100)}%
              </span>
            </div>
            {index < phases.length - 1 && (
              <ArrowRight aria-hidden="true" className="absolute -right-2 top-1/2 hidden size-4 -translate-y-1/2 text-violet-300 xl:block" />
            )}
          </li>
        ))}
      </ol>
      {phases.length === 0 && (
        <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No emotion phases were returned for this analysis.
        </p>
      )}
    </section>
  );
}
