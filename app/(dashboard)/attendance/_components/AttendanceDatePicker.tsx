"use client"

import { Input } from "@/components/ui/input"
import { format } from "date-fns"

interface Props {
  selectedDate: Date
}

export function AttendanceDatePicker({ selectedDate }: Props) {
  return (
    <Input
      type="date"
      defaultValue={format(selectedDate, "yyyy-MM-dd")}
      className="w-40"
      onChange={(e) => {
        window.location.href = `?date=${e.target.value}`
      }}
    />
  )
}
