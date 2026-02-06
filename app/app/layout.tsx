import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
        {children}
      </div>
    </section>
  );
}
