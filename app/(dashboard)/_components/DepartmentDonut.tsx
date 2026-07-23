'use client'

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface DepartmentData {
  name: string
  value: number
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function DepartmentDonut() {
  const [data, setData] = useState<DepartmentData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/dashboard")
        const json = await response.json()
        setData(json.departments || [])
      } catch (error) {
        console.error("Failed to fetch department data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length && payload[0]) {
              const value = payload[0].value as number
              const percentage = ((value / total) * 100).toFixed(1)
              return (
                <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                  <p className="text-sm font-medium">{payload[0].name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {value} employees ({percentage}%)
                  </p>
                </div>
              )
            }
            return null
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}