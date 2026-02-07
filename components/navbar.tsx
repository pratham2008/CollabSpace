"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";
import { NotificationsDropdown } from "@/components/notifications-dropdown";

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    return scrollY.on("change", (y) => setScrolled(y > 10));
  }, [scrollY]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showUserMenu]);

  const pillBase =
    "relative h-12 inline-flex items-center rounded-full backdrop-blur-xl transition-all duration-300";
  const pillTop = "bg-transparent border border-transparent shadow-none";
  const pillScrolled =
    "bg-white/6 border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.22)]";

  const isLoggedIn = status === "authenticated" && session?.user;

  return (
    <motion.header
      className="sticky top-0 z-50"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">
        <div className="flex h-[72px] items-center justify-between">
          {/* LEFT GROUP */}
          <motion.div
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`${pillBase} ${scrolled ? pillScrolled : pillTop} px-5`}
          >
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-white/0 transition-all duration-500 group-hover:bg-white/10" />
            </span>

            <Link href="/" className="text-lg font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                CollabSpace
              </span>
            </Link>

            <div className="ml-8 hidden items-center gap-6 sm:flex">
              <NavLink href="/explore">Explore</NavLink>
              <NavLink href="/about">About</NavLink>
              {isLoggedIn && <NavLink href="/app">Dashboard</NavLink>}
              {isLoggedIn && <NavLink href="/app/chat">Chat</NavLink>}
            </div>
          </motion.div>

          {/* RIGHT GROUP */}
          <motion.div
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`${pillBase} ${scrolled ? pillScrolled : pillTop} px-4`}
          >
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
            ) : isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <NotificationsDropdown />

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="flex items-center gap-2 rounded-full bg-white/5 py-1.5 pl-1.5 pr-3 text-slate-100 transition hover:bg-white/10"
                  >
                    <div className="relative h-7 w-7 overflow-hidden rounded-full border border-white/10">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || ""}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/30 to-violet-500/30">
                          <User className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-slate-900/95 p-1.5 backdrop-blur-xl shadow-xl"
                    >
                      <div className="border-b border-white/10 px-3 py-2.5">
                        <p className="text-sm font-medium text-slate-100 truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {session.user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <MenuLink href="/app" icon={<User className="h-4 w-4" />}>
                          Dashboard
                        </MenuLink>
                        <MenuLink href={`/profile/${session.user?.collabspaceId || session.user?.id}`} icon={<User className="h-4 w-4" />}>
                          View Profile
                        </MenuLink>
                        <MenuLink href="/app/settings" icon={<Settings className="h-4 w-4" />}>
                          Settings
                        </MenuLink>
                      </div>

                      <div className="border-t border-white/10 pt-1">
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-2 text-base text-slate-300/90 transition hover:text-slate-100"
                >
                  Log in
                </Link>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/signup"
                    className={[
                      "ml-2 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
                      scrolled
                        ? "bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 text-slate-950 shadow-[0_0_26px_rgba(56,189,248,0.28)] hover:shadow-[0_0_34px_rgba(56,189,248,0.40)]"
                        : "bg-white/0 text-slate-100 hover:text-white",
                    ].join(" ")}
                  >
                    Sign up
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative text-base text-slate-300/90 transition hover:text-slate-100"
    >
      <span>{children}</span>
      <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 transition-transform duration-300 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 blur-sm bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5"
    >
      <span className="text-slate-400">{icon}</span>
      {children}
    </Link>
  );
}
