"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EmotionMetrics from "features/video-analysis/components/EmotionMetrics";
import EmotionsChart from "features/video-analysis/components/EmotionsGraph";
import PhaseList from "features/video-analysis/components/PhaseList";
import ProcessingOverlay from "features/video-analysis/components/ProcessingOverlay";
import SummaryCard from "features/video-analysis/components/SummaryCard";
import { useSessionAnalysis } from "features/video-analysis/hooks/useSessionAnalysis";

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const { status, results, error } = useSessionAnalysis(sessionId);

  if (!sessionId) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <p className="font-serif text-xl text-gray-900">No session selected</p>
        <p className="mt-2 text-sm text-gray-500">Upload a video to start an analysis.</p>
        <Link
          href="/upload"
          className="mt-6 inline-block rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white"
        >
          Upload video
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white px-6 py-8 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  const phases = results?.phases ?? [];
  const isReady = status?.status === "done" && results;

  if (!isReady) {
    return <ProcessingOverlay progress={status?.progress ?? 0} />;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="border-b border-slate-200 pb-5">
        <div>
          <h1 className="font-space text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Analysis results</h1>
          <p className="mt-2 text-sm text-slate-500">Emotional patterns discovered throughout your video.</p>
        </div>
      </div>

      <EmotionMetrics phases={phases} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <EmotionsChart phases={phases} />
        </div>
        <div className="xl:col-span-4">
          <SummaryCard summary={results.summary} />
        </div>
      </div>
      <PhaseList phases={phases} />
    </div>
  );
}
