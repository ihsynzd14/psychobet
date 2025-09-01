"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SimpleDatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  className?: string
  inputClassName?: string
}

export function SimpleDatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled,
  className,
  inputClassName
}: SimpleDatePickerProps) {
  const [inputValue, setInputValue] = React.useState(
    date ? format(date, "yyyy-MM-dd") : ""
  )

  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, "yyyy-MM-dd"))
    } else {
      setInputValue("")
    }
  }, [date])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    if (value) {
      const newDate = new Date(value)
      if (!isNaN(newDate.getTime())) {
        // Check if date is disabled
        if (disabled && disabled(newDate)) {
          return
        }
        onDateChange?.(newDate)
      }
    } else {
      onDateChange?.(undefined)
    }
  }

  // Get min date if disabled function provided
  const getMinDate = () => {
    if (!disabled) return undefined
    
    // Test with today's date to see if past dates are disabled
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (disabled(yesterday)) {
      return format(today, "yyyy-MM-dd")
    }
    
    return undefined
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="date"
          value={inputValue}
          onChange={handleDateChange}
          min={getMinDate()}
          className={cn(
            "w-full bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100",
            inputClassName
          )}
        />
        {!inputValue && (
          <div 
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground dark:text-gray-400"
          >
           
          </div>
        )}
      </div>
    </div>
  )
}