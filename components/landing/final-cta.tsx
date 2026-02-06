"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export function FinalCTA() {
  return (
    <section className="relative w-full py-16 sm:py-20">
      {/* full-width subtle background wash */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08),transparent_65%)]" />

      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Start your next project with the right people.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300/85">
            Discover projects, form teams, and build with students who actually
            care about shipping.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {/* Primary */}
            <Button
              asChild
              className="group rounded-full bg-sky-500 px-6 text-slate-950 hover:bg-sky-400"
            >
              <Link href="/signup" className="inline-flex items-center gap-2">
                Get started
                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            {/* Secondary */}
            <InteractiveHoverButton
              text="Explore projects"
              onClick={() => {
                window.location.href = "/explore";
              }}
              className="border-white/15 bg-transparent text-slate-100"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
