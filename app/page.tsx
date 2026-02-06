import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Hero } from "@/components/ui/animated-hero";
import { ProjectCanvas } from "@/components/landing/project-canvas";
import { FinalCTA } from "@/components/landing/final-cta";
import { TrustStrip } from "@/components/landing/trust-strip";

export default async function HomePage() {
  // Check if user is logged in - redirect to dashboard
  const session = await auth();

  if (session?.user) {
    redirect("/app");
  }

  return (
    <main className="flex flex-col">
      <section className="flex min-h-[calc(100vh-6rem)] flex-col justify-center">
        <Hero />
      </section>

      <ProjectCanvas />
      <TrustStrip />
      <FinalCTA />
    </main>
  );
}
