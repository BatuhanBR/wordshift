import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "rounded-xl text-white bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover:scale-[1.02] active:scale-[0.98]",
        destructive: "rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/60 hover:scale-[1.02] active:scale-[0.98]",
        outline: "rounded-xl border-2 border-transparent bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-border bg-origin-border text-white backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98] [background-clip:padding-box,border-box] [background-origin:padding-box,border-box] bg-[rgba(10,10,15,0.8)]",
        secondary: "rounded-xl bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]",
        ghost: "rounded-xl hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-fuchsia-500/10",
        link: "bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
