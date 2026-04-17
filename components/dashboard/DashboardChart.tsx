"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Skeleton from "@/components/ui/Skeleton";

type DataPoint = { fecha: string; total: number };

export default function DashboardChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/evolucion")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Skeleton className="h-[260px] w-full rounded-[var(--radius-lg)]" />
    );
  }

  return (
    <div className="bg-surface rounded-[var(--radius-lg)] shadow-xs border border-border p-4 md:p-6 mb-4 md:mb-5">
      <h2 className="font-semibold text-text-primary text-sm md:text-[15px] mb-4">
        Evolucion de consultas (ultimos 30 dias)
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="fecha"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val: string, index: number) =>
              index % 5 === 0 ? val : ""
            }
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value) => [`${value ?? 0} consultas`, "Total"]}
            labelStyle={{ color: "#0F172A", fontWeight: 600 }}
            contentStyle={{
              borderRadius: "var(--radius-md)",
              border: "1px solid #E2E8F0",
              boxShadow: "var(--shadow-md)",
              fontSize: "13px",
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#2563EB"
            strokeWidth={2}
            fill="url(#colorConsultas)"
            dot={false}
            activeDot={{ r: 4, fill: "#2563EB" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
