"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showPassword?: boolean
  onTogglePassword?: (show: boolean) => void
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showPassword: controlledShowPassword, onTogglePassword, ...props }, ref) => {
    const [internalShowPassword, setInternalShowPassword] = React.useState(false)
    const isControlled = controlledShowPassword !== undefined
    const showPassword = isControlled ? controlledShowPassword : internalShowPassword

    const togglePassword = () => {
      if (isControlled && onTogglePassword) {
        onTogglePassword(!showPassword)
      } else {
        setInternalShowPassword(!internalShowPassword)
      }
    }

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={togglePassword}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }

