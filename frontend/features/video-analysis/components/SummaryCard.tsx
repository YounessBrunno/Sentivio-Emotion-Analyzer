import { MessageSquareQuote } from "lucide-react";

type SummaryCardProps = {
  summary: string;
};

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <section className="flex h-full min-h-[22rem] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.4)]">
      <div className="border-b border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-5">
        <span className="grid size-10 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
          <MessageSquareQuote aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </span>
        <h2 className="mt-4 font-space text-xl font-semibold tracking-tight text-slate-950">Session summary</h2>
        <p className="mt-1 text-sm text-slate-500">A narrative read of the emotional journey.</p>
      </div>
      <div className="flex flex-1 p-5">
        <p className="self-center text-[15px] leading-7 text-slate-600">{summary}</p>
      </div>
    </section>
  );
}
