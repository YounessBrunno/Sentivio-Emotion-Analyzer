import { Progress } from "shared/ui/progress";
import type { SessionStatus } from "../types";

type SessionInfoProps = {
  status: SessionStatus | null;
};

const statusLabel: Record<string, string> = {
  uploading: "Preparing upload",
  uploaded: "Processing video",
  done: "Complete",
};

export default function SessionInfo({ status }: SessionInfoProps) {
  const label = status ? (statusLabel[status.status] ?? status.status) : "Waiting";
  const progress = status?.progress ?? 0;
  const shortId = status?.session_id?.slice(0, 8) ?? "—";

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-gray-900">Session</h2>
      <p className="mt-0.5 text-xs text-gray-500">Current analysis run</p>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Status</dt>
          <dd className="font-medium capitalize text-gray-900">{label}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Session</dt>
          <dd className="font-mono text-xs text-gray-700">{shortId}…</dd>
        </div>
      </dl>

      {status?.status !== "done" && (
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
