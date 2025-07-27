"use client"

import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TimelineData } from "@/lib/analytics"

interface TimelineChartProps {
  data: TimelineData[]
  onPeriodClick?: (period: TimelineData) => void
  className?: string
  variant?: "line" | "area"
}

export function TimelineChart({
  data,
  onPeriodClick,
  className = "",
  variant = "area",
}: TimelineChartProps) {
  // Validate data
  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full h-[300px] flex items-center justify-center text-muted-foreground ${className}`}>
        No timeline data available
      </div>
    )
  }

  const handleClick = (data: any) => {
    if (onPeriodClick && data?.activePayload) {
      onPeriodClick(data.activePayload[0].payload)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">{label}</p>
          <div className="space-y-1 text-sm">
            <p style={{ color: "hsl(var(--chart-primary))" }}>
              {data.playlists} playlist{data.playlists !== 1 ? "s" : ""}
            </p>
            <p className="text-muted-foreground">{data.songs} total tracks</p>
          </div>
        </div>
      )
    }
    return null
  }

  const ChartComponent = variant === "area" ? AreaChart : LineChart

  return (
    <div className={`chart-container ${className}`}>
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onClick={handleClick}
          style={{ cursor: "pointer" }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--chart-grid))"
            opacity={0.3}
          />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: "hsl(var(--chart-text))" }}
            axisLine={{ stroke: "hsl(var(--chart-grid))" }}
            tickLine={{ stroke: "hsl(var(--chart-grid))" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--chart-text))" }}
            axisLine={{ stroke: "hsl(var(--chart-grid))" }}
            tickLine={{ stroke: "hsl(var(--chart-grid))" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {variant === "area" ? (
            <>
              <Area
                type="monotone"
                dataKey="playlists"
                stroke="hsl(var(--chart-primary))"
                fill="hsl(var(--chart-primary))"
                fillOpacity={0.3}
                strokeWidth={2}
                name="Playlists"
              />
              <Area
                type="monotone"
                dataKey="songs"
                stroke="hsl(var(--chart-secondary))"
                fill="hsl(var(--chart-secondary))"
                fillOpacity={0.1}
                strokeWidth={1}
                strokeDasharray="4 4"
                name="Total Tracks"
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="playlists"
                stroke="hsl(var(--chart-primary))"
                strokeWidth={3}
                dot={{
                  fill: "hsl(var(--chart-primary))",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: "hsl(var(--chart-primary))",
                  strokeWidth: 2,
                }}
                name="Playlists"
              />
              <Line
                type="monotone"
                dataKey="songs"
                stroke="hsl(var(--chart-secondary))"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{
                  fill: "hsl(var(--chart-secondary))",
                  strokeWidth: 2,
                  r: 3,
                }}
                activeDot={{
                  r: 5,
                  stroke: "hsl(var(--chart-secondary))",
                  strokeWidth: 2,
                }}
                name="Total Tracks"
              />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )
}
