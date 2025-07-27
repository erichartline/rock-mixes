"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ArtistFrequencyData } from "@/lib/analytics"

interface ArtistFrequencyChartProps {
  data: ArtistFrequencyData[]
  onArtistClick?: (artist: ArtistFrequencyData) => void
  className?: string
}

export function ArtistFrequencyChart({
  data,
  onArtistClick,
  className = "",
}: ArtistFrequencyChartProps) {
  // Validate data
  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full h-[400px] flex items-center justify-center text-muted-foreground ${className}`}>
        No artist data available
      </div>
    )
  }

  const handleBarClick = (data: any) => {
    if (onArtistClick && data?.payload) {
      onArtistClick(data.payload)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} tracks ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={{ stroke: "#e2e8f0" }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            fill="#3b82f6"
            radius={[0, 4, 4, 0]}
            onClick={handleBarClick}
            style={{ cursor: "pointer" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
