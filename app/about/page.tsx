import { Metadata } from "next";
import Link from "next/link";
import { Users, Rocket, Heart, Sparkles, ArrowLeft, Quote } from "lucide-react";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
    title: "About - CollabSpace",
    description: "Learn about CollabSpace - the platform for finding teammates for projects, hackathons, and research.",
};

export default async function AboutPage() {
    const session = await auth();
    const isLoggedIn = !!session?.user;

    return (
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
            {/* Back Link */}
            <Link
                href={isLoggedIn ? "/app" : "/"}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition mb-8"
            >
                <ArrowLeft className="h-4 w-4" />
                {isLoggedIn ? "Back to dashboard" : "Back to home"}
            </Link>

            {/* Hero */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                        About CollabSpace
                    </span>
                </h1>
                <p className="mt-4 text-lg text-slate-300/80 max-w-2xl mx-auto">
                    Where ideas meet their perfect team
                </p>
            </div>

            {/* Key Quote */}
            <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-violet-500/10 p-8 backdrop-blur-xl mb-12">
                <Quote className="h-8 w-8 text-sky-400/60 mb-4" />
                <p className="text-xl text-slate-100 font-medium leading-relaxed mb-4">
                    "People don&apos;t fail at projects because of lack of tools.<br />
                    They fail because of lack of the right teammates."
                </p>
                <p className="text-sm text-slate-400 italic">
                    If you understand this, you understand CollabSpace.
                </p>
            </div>

            {/* Philosophy */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl mb-12">
                <p className="text-slate-300/90 text-center leading-relaxed">
                    <strong className="text-slate-100">CollabSpace is not about managing projects</strong> —
                    it&apos;s about forming the right teams <em>before</em> the project begins.
                </p>
            </div>

            {/* Slogans */}
            <div className="grid gap-6 sm:grid-cols-2 mb-16">
                <SloganCard
                    icon={<Users className="h-8 w-8" />}
                    title="Find Your Dream Team"
                    description="Connect with passionate developers, designers, and innovators who share your vision."
                    gradient="from-sky-500/20 to-cyan-500/20"
                    border="border-sky-500/30"
                />
                <SloganCard
                    icon={<Rocket className="h-8 w-8" />}
                    title="Build Something Amazing"
                    description="Transform your ideas into reality with the right collaborators by your side."
                    gradient="from-violet-500/20 to-purple-500/20"
                    border="border-violet-500/30"
                />
                <SloganCard
                    icon={<Heart className="h-8 w-8" />}
                    title="Grow Together"
                    description="Learn from peers, share knowledge, and level up your skills through collaboration."
                    gradient="from-pink-500/20 to-rose-500/20"
                    border="border-pink-500/30"
                />
                <SloganCard
                    icon={<Sparkles className="h-8 w-8" />}
                    title="Make It Happen"
                    description="From hackathons to startups, bring your projects to life with CollabSpace."
                    gradient="from-amber-500/20 to-orange-500/20"
                    border="border-amber-500/30"
                />
            </div>

            {/* Mission */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-8 backdrop-blur-xl text-center mb-12">
                <h2 className="text-2xl font-semibold text-slate-100 mb-4">Our Mission</h2>
                <p className="text-slate-300/80 max-w-2xl mx-auto leading-relaxed mb-4">
                    We believe that the best projects are built by diverse teams with complementary skills.
                    CollabSpace connects students, professionals, and hobbyists with the teammates they need
                    to turn ambitious ideas into reality.
                </p>
                <p className="text-sky-400 font-medium">
                    CollabSpace helps students form the right teams for the right projects, faster.
                </p>
            </div>

            {/* CTA - Dynamic based on login status */}
            <div className="text-center">
                <Link
                    href={isLoggedIn ? "/explore" : "/signup"}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.4)] transition"
                >
                    <Sparkles className="h-5 w-5" />
                    {isLoggedIn ? "Explore Projects" : "Join CollabSpace"}
                </Link>
            </div>
        </main>
    );
}

function SloganCard({
    icon,
    title,
    description,
    gradient,
    border,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
    border: string;
}) {
    return (
        <div className={`rounded-2xl border ${border} bg-gradient-to-br ${gradient} p-6 backdrop-blur-xl`}>
            <div className="text-sky-400 mb-3">{icon}</div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
            <p className="text-sm text-slate-300/80">{description}</p>
        </div>
    );
}
