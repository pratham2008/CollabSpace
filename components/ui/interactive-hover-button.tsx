"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex h-10 min-w-[10.25rem] items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-slate-100 backdrop-blur shadow-[0_0_30px_rgba(56,189,248,0.15)] transition hover:border-sky-400/35",
        className,
      )}
      {...props}
    >
      {/* calm fill behind (not too loud) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[12%] top-[42%] h-2 w-2 rounded-lg bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 transition-all duration-300 group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-[1.55]" />
      </div>

      {/* subtle sheen sweep */}
      <span className="pointer-events-none absolute inset-y-0 left-[-30%] w-[30%] -skew-x-12 bg-white/25 opacity-0 blur-md transition-all duration-500 group-hover:left-[120%] group-hover:opacity-100" />

      {/* default text slides out */}
      <span className="relative z-10 inline-flex items-center gap-2 transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
        {text}
      </span>

      {/* hover text slides in */}
      <span className="absolute z-10 inline-flex items-center gap-2 translate-x-10 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        {text}
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
