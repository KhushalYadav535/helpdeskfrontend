"use client"

import { Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface RoleGatedNumberInputProps {
  label: string
  role: string
  value: string
  onChange: (value: string) => void
  min?: number
  max?: number
  className?: string
}

export function RoleGatedNumberInput({
  label,
  role,
  value,
  onChange,
  min = 1,
  max = 999,
  className,
}: RoleGatedNumberInputProps) {
  const isEditable = role === "tenant-admin"
  const numericValue = parseInt(value, 10)
  const isInvalid = isEditable && value !== "" && (isNaN(numericValue) || numericValue < min)

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label with lock icon */}
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        {!isEditable && (
          <div className="group relative">
            <Lock
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50">
              Only Tenant Admin can modify this setting.
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-popover" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={!isEditable}
        aria-label="Max Tickets Per Day"
        aria-disabled={!isEditable}
        aria-describedby={isInvalid ? "max-tickets-error" : undefined}
        className={cn(
          "mt-1",
          !isEditable && "bg-muted cursor-not-allowed opacity-60",
          isInvalid && "border-red-500 focus-visible:ring-red-500",
        )}
      />

      {/* Inline error */}
      {isInvalid && (
        <p
          id="max-tickets-error"
          className="text-xs text-red-500 font-medium"
          role="alert"
        >
          {min === 1 ? "Max tickets must be at least 1." : `Max tickets must be at least ${min}.`}
        </p>
      )}
    </div>
  )
}
