import { Progress } from "shared/ui/progress";

type ProcessingOverlayProps = {
  progress: number;
};

export default function ProcessingOverlay({ progress }: ProcessingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={`Video processing: ${progress}% complete`}
    >
      <section className="w-full max-w-xl ">
        
        <div className="relative">
          <Progress
            value={progress}
            aria-hidden="true"
            className="h-13 rounded-2xl bg-gray-200 [&>[data-slot=progress-indicator]]:bg-gray-950 [&>[data-slot=progress-indicator]]:duration-500"
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums text-white mix-blend-difference">
            {progress}%
          </span>
        </div>
      </section>
    </div>
  );
}
