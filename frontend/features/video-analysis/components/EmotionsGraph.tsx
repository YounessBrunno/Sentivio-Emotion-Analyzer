"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import type { EmotionPhase } from "../types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

type EmotionsChartProps = {
  phases: EmotionPhase[];
};

const chartFont = { family: "var(--font-inter), sans-serif" };

export default function EmotionsChart({ phases }: EmotionsChartProps) {
  const labels = phases.map((phase) => `Phase ${phase.phase_index}`);
  const confidenceData = phases.map((phase) => Math.round(phase.average_confidence * 100));
  const durationData = phases.map((phase) => phase.end_frame - phase.start_frame + 1);

  const lineData = {
    labels,
    datasets: [
      {
        label: "Confidence",
        data: confidenceData,
        borderColor: "#7c3aed",
        backgroundColor: "rgba(124, 58, 237, 0.14)",
        fill: true,
        tension: 0.42,
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#7c3aed",
        pointBorderWidth: 2.5,
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: "Frames",
        data: durationData,
        backgroundColor: "#c4b5fd",
        hoverBackgroundColor: "#8b5cf6",
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 42,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e1b4b",
        titleColor: "#ddd6fe",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: { label: (context: { parsed: { y: number | null } }) => `${context.parsed.y ?? 0}% confidence` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94a3b8", font: { ...chartFont, size: 11, weight: 500 }, padding: 10 },
      },
      y: {
        min: 0,
        max: 100,
        border: { display: false },
        grid: { color: "#ede9fe", drawTicks: false },
        ticks: {
          color: "#94a3b8",
          font: { ...chartFont, size: 11 },
          padding: 10,
          callback: (value: string | number) => `${value}%`,
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e1b4b",
        titleColor: "#ddd6fe",
        bodyColor: "#ffffff",
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: { label: (context: { parsed: { y: number | null } }) => `${context.parsed.y ?? 0} frames` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94a3b8", font: { ...chartFont, size: 11, weight: 500 }, padding: 8 },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "#f1f5f9", drawTicks: false },
        ticks: { color: "#94a3b8", font: { ...chartFont, size: 10 }, padding: 8, precision: 0 },
      },
    },
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.4)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="font-space text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Emotion flow</p>
          <h2 className="mt-1 font-space text-xl font-semibold tracking-tight text-slate-950">Confidence over time</h2>
          <p className="mt-1 text-sm text-slate-500">How confidently each emotional phase was detected.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
          <span className="size-2 rounded-full bg-violet-500" /> Confidence score
        </div>
      </div>

      <div className="p-4 pt-5 sm:p-6 sm:pt-5">
        <div className="h-64 sm:h-72">
          <Line data={lineData} options={lineOptions} />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-space text-sm font-semibold text-slate-800">Phase duration</h3>
              <p className="mt-0.5 text-xs text-slate-500">Frames included in each phase</p>
            </div>
            <span className="text-xs font-medium text-slate-400">Frame count</span>
          </div>
          <div className="h-36">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </section>
  );
}
