"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  className?: string
  buttonClassName?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled,
  className,
  buttonClassName
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
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

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setIsOpen(false)
  }

  const handleButtonClick = () => {
    setIsOpen(!isOpen)
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
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            onClick={handleButtonClick}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              buttonClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">
              Select Date
            </div>
            <Input
              type="date"
              value={inputValue}
              onChange={handleDateInputChange}
              min={getMinDate()}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              Use the date picker above or type a date
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Enhanced version with better validation
interface DateFieldProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  label?: string
  error?: string
  description?: string
  required?: boolean
  className?: string
}

export function DateField({
  value,
  onChange,
  placeholder = "Select date",
  disabled,
  label,
  error,
  description,
  required,
  className
}: DateFieldProps) {
  const [inputDate, setInputDate] = React.useState(
    value ? format(value, "yyyy-MM-dd") : ""
  )

  React.useEffect(() => {
    if (value) {
      setInputDate(format(value, "yyyy-MM-dd"))
    } else {
      setInputDate("")
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value
    setInputDate(dateValue)
    
    if (dateValue) {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        // Check if disabled
        if (disabled && disabled(date)) {
          return
        }
        onChange?.(date)
      }
    } else {
      onChange?.(undefined)
    }
  }

  const getMinDate = () => {
    if (!disabled) return undefined
    
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (disabled(yesterday)) {
      return format(today, "yyyy-MM-dd")
    }
    
    return undefined
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <Input
          type="date"
          value={inputDate}
          onChange={handleChange}
          min={getMinDate()}
          className={cn(
            "w-full",
            error && "border-destructive focus-visible:border-destructive"
          )}
          placeholder={placeholder}
        />
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
      
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}