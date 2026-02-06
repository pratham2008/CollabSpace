import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "CollabSpace",
  description: "Find teammates for projects, hackathons, and research.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-black text-slate-100 antialiased">
        <Providers>
          {/* Background glow layers */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-x-0 top-[-220px] mx-auto h-[360px] max-w-3xl rounded-full bg-sky-500/25 blur-3xl" />
            <div className="absolute inset-x-0 bottom-[-260px] mx-auto h-[360px] max-w-4xl rounded-full bg-violet-600/25 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.16),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_rgba(15,23,42,1))]" />
          </div>

          <Navbar />

          {/* main content */}
          <main className="relative flex min-h-screen w-full flex-col pb-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

