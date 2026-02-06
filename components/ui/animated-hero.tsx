"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

function Hero() {
  const router = useRouter();
  const [titleNumber, setTitleNumber] = useState(0);

  const titles = useMemo(
    () => ["teams", "projects", "collaborators", "ideas", "hackathons"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev + 1) % 5);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [titleNumber]);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-32">
          {/* giga-style pill (single element, no Button wrapper) */}
          <Link
            href="#why"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-medium text-slate-100 backdrop-blur transition hover:bg-white/10"
          >
            {/* blinking dot */}
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400" />
            </span>

            <span>See why students use CollabSpace</span>

            <MoveRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>

          {/* Title + rotating keyword */}
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-balance text-4xl font-semibold tracking-tighter text-slate-50 md:text-6xl">
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                Find the best people
              </span>

              {/* Centered line (no ml-20 hacks) */}
              <span className="mt-3 inline-flex w-full items-center justify-center gap-2 text-slate-50 ml-30">
                <span className="leading-[1.15]">for your</span>

                <span className="relative inline-block w-[13ch] overflow-hidden leading-[1.5em] align-middle">
                  {/* This line box prevents clipping for p/j/y/g */}
                  <span className="block h-[1.5em] leading-[1.5em]" />

                  {titles.map((title, index) => (
                    <motion.span
                      key={index}
                      className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-left font-semibold bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: "70%", filter: "blur(6px)" }}
                      animate={
                        titleNumber === index
                          ? { opacity: 1, y: 0, filter: "blur(0px)" }
                          : {
                            opacity: 0,
                            y: titleNumber > index ? "-70%" : "70%",
                            filter: "blur(6px)",
                          }
                      }
                      transition={{ type: "spring", stiffness: 55, damping: 16 }}
                    >
                      {title}
                    </motion.span>
                  ))}
                </span>
              </span>


              {/* <motion.span
                      key={index}
                      className="absolute left-0 right-0 top-0 font-semibold text-center"
                      initial={{ opacity: 0, y: 24 }}
                      transition={{ type: "spring", stiffness: 55, damping: 14 }}
                      animate={
                        titleNumber === index
                          ? { y: 0, opacity: 1 }
                          : { y: titleNumber > index ? "-150%" : "150%", opacity: 0 }
                      }
                    >
                      {title}
                    </motion.span> */}
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed tracking-tight text-slate-300/90">
              CollabSpace connects students who want to build something real —
              from mini-projects and college hackathons to research work and
              early startup ideas. Discover projects, form teams, and start
              shipping faster.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <InteractiveHoverButton
              text="Explore projects"
              onClick={() => router.push("/explore")}
            />

            <Button
              asChild
              className="group rounded-full bg-sky-500 px-6 text-slate-950 hover:bg-sky-400"
            >
              <Link href="/signup" className="inline-flex items-center gap-2">
                Get started
                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
