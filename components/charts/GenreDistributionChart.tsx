"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { GenreDistributionData } from "@/lib/analytics"

interface GenreDistributionChartProps {
  data: GenreDistributionData[]
  onGenreClick?: (genre: GenreDistributionData) => void
  className?: string
}

export function GenreDistributionChart({
  data,
  onGenreClick,
  className = "",
}: GenreDistributionChartProps) {
  // Validate data
  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full h-[400px] flex items-center justify-center text-muted-foreground ${className}`}>
        No genre data available
      </div>
    )
  }

  const handleCellClick = (data: any) => {
    if (onGenreClick && data) {
      onGenreClick(data)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
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

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap chart-legend justify-center mt-3">
        {payload?.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity px-1 py-0.5"
            onClick={() => handleCellClick(entry.payload)}>
            <div
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground truncate max-w-[70px] text-[10px]">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`chart-container ${className}`}>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={2}
            dataKey="count"
            onClick={handleCellClick}
            style={{ cursor: "pointer" }}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
