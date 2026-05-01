"use client";

import { ApiUsageTrendPoint } from "@/types/admin";
import { useMemo } from "react";

interface TrendChartProps {
  data: ApiUsageTrendPoint[];
  title: string;
  isLoading?: boolean;
}

export function TrendChart({ data, title, isLoading }: TrendChartProps) {
  const maxValue = useMemo(() => {
    if (!data.length) return 0;
    return Math.max(...data.map((d) => d.request_count));
  }, [data]);

  const points = useMemo(() => {
    if (!data.length || maxValue === 0) return "";

    const width = 1000;
    const height = 240;
    const padding = 20;

    return data
      .map((d, i) => {
        const x =
          data.length === 1
            ? width / 2
            : (i / (data.length - 1)) * (width - 2 * padding) + padding;

        const y =
          height -
          padding -
          (d.request_count / maxValue) * (height - 2 * padding);

        return `${x},${y}`;
      })
      .join(" ");
  }, [data, maxValue]);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500">API requests over the selected period</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Requests</span>
        </div>
      </div>

      <div className="relative h-[240px] w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : data.length > 0 ? (
          <svg
            viewBox="0 0 1000 240"
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p) => (
              <line
                key={p}
                x1="0"
                y1={20 + p * 200}
                x2="1000"
                y2={20 + p * 200}
                stroke="currentColor"
                strokeOpacity="0.05"
                strokeWidth="1"
              />
            ))}

            {/* Area */}
            <path
              d={`M 20,220 L ${points} L 980,220 Z`}
              fill="url(#gradient)"
              className="transition-all duration-700 ease-in-out"
            />

            {/* Line */}
            <polyline
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
              className="transition-all duration-700 ease-in-out"
              style={{ filter: "drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3))" }}
            />

            {/* Dots */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 960 + 20;
              const y = 220 - (d.request_count / maxValue) * 200 - 20;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="6"
                  className="cursor-pointer fill-white stroke-blue-500 stroke-[3] transition-all hover:r-8"
                >
                  <title>{`${d.period}: ${d.request_count} requests`}</title>
                </circle>
              );
            })}
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No data available for the selected period
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
        <span>{data[0]?.period?.split("T")[0] || "Start"}</span>
        <span>{data[Math.floor(data.length / 2)]?.period?.split("T")[0] || "Middle"}</span>
        <span>{data[data.length - 1]?.period?.split("T")[0] || "End"}</span>
      </div>
    </div>
  );
}
