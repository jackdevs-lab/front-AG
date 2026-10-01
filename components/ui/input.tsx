import * as React from "react"

import { cn } from "@/lib/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, autoComplete = 'off', ...props }, ref) => {
    return (
      <input
        type={type}
        autoComplete={autoComplete}
        className={cn("...", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }