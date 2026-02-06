import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400/60 transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50",
        "hover:border-white/20 hover:bg-white/[0.07]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }

