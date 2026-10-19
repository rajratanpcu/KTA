import * as React from "react"
import { cn } from "@/utils/cn"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          'border-transparent bg-primary text-primary-foreground': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'border-transparent bg-green-500 text-white': variant === 'success',
          'border-transparent bg-yellow-500 text-white': variant === 'warning',
          'border-transparent bg-destructive text-destructive-foreground': variant === 'destructive',
          'text-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
