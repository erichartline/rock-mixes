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

  const handleCellClick = (data: any, index: number) => {
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
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload?.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center gap-1 text-xs cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleCellClick(entry.payload, index)}>
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground truncate max-w-[80px]">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
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
