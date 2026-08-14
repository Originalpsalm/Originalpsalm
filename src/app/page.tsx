import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpenCheck,
  Check,
  Crown,
  LineChart,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Badge, ButtonLink, naira } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { libraryStats } from "@/lib/queries";
import { EXAM_BODIES } from "@/lib/types";
import { PREMIUM_PRICE_NAIRA } from "@/lib/billing";

export default async function LandingPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const stats = libraryStats();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-20">
      {/* ------------------------------------------------------- header --- */}
      <header className="flex items-center justify-between py-6">
        <Logo size={34} />
        <nav className="flex items-center gap-2">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink href="/signup" size="sm">
            Get started
          </ButtonLink>
        </nav>
      </header>

      {/* --------------------------------------------------------- hero --- */}
      <section className="animate-rise py-14 text-center sm:py-20">
        <Badge tone="gold" className="mb-6">
          <Sparkles size={12} /> WAEC · JAMB · NECO · NABTEB
        </Badge>

        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
          Past questions, <span className="text-gradient">worked answers</span>, and the squad to
          study with.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-mist">
          GURU puts real past questions in your pocket, shows you exactly how each answer is
          reached, then lets you pull your classmates into a study group so nobody prepares alone.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/signup" size="lg">
            Start practising free
          </ButtonLink>
          <ButtonLink href="/login" variant="ghost" size="lg">
            I already have an account
          </ButtonLink>
        </div>

        <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-3">
          {[
            { label: "Questions", value: stats.questions.toLocaleString("en-NG") },
            { label: "Past papers", value: stats.papers },
            { label: "Subjects", value: stats.subjects },
          ].map((item) => (
            <div key={item.label} className="surface px-4 py-5">
              <dt className="text-xs uppercase tracking-wider text-mist">{item.label}</dt>
              <dd className="mt-1 text-3xl font-extrabold text-leaf-400">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* --------------------------------------------------- exam bodies --- */}
      <section className="grid gap-4 sm:grid-cols-3">
        {EXAM_BODIES.map((body) => (
          <article key={body.id} className="card p-6">
            <h2 className="text-2xl font-extrabold text-leaf-400">{body.name}</h2>
            <p className="mt-1 text-xs uppercase tracking-wide text-mist/70">{body.full}</p>
            <p className="mt-4 text-sm leading-relaxed text-mist">{body.blurb}</p>
          </article>
        ))}
      </section>

      {/* ------------------------------------------------------ features --- */}
      <section className="mt-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Everything you need for exam year
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: BookOpenCheck,
              title: "Answers that teach",
              body: "Every question ends with the working — not just the letter. You learn the method, so the next one is easier.",
            },
            {
              icon: Timer,
              title: "Real exam conditions",
              body: "A timer that mirrors CBT pacing, so exam day is not the first time you feel the clock.",
            },
            {
              icon: Users,
              title: "Study groups",
              body: "Create a group, share a 6-letter code, and your classmates are in. Discuss questions in the group chat.",
            },
            {
              icon: LineChart,
              title: "Know your weak topics",
              body: "GURU tracks accuracy per subject and topic so you revise what is actually failing you.",
            },
            {
              icon: Crown,
              title: "Premium for less than a bottle of Coke a week",
              body: `${naira(PREMIUM_PRICE_NAIRA)} a month unlocks every full paper, every explanation and unlimited practice.`,
            },
            {
              icon: ShieldCheck,
              title: "One account, one student",
              body: "Accounts cannot be shared, which is exactly why we can keep the price this low for everybody.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <article key={title} className="card p-6">
              <div className="grid size-11 place-items-center rounded-xl bg-leaf-500/10 text-leaf-400">
                <Icon size={21} strokeWidth={2.1} />
              </div>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- pricing --- */}
      <section className="mt-20 grid gap-4 md:grid-cols-2">
        <article className="card p-8">
          <h3 className="text-xl font-bold">Free</h3>
          <p className="mt-1 text-sm text-mist">Enough to see if GURU works for you.</p>
          <p className="mt-6 text-4xl font-extrabold">{naira(0)}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "First 5 questions of every past paper",
              "Study groups and group chat",
              "Add classmates and friends",
              "Basic progress tracking",
            ].map((line) => (
              <li key={line} className="flex gap-2.5 text-mist">
                <Check size={17} className="mt-0.5 shrink-0 text-leaf-400" />
                {line}
              </li>
            ))}
          </ul>
          <ButtonLink href="/signup" variant="ghost" className="mt-8 w-full">
            Create free account
          </ButtonLink>
        </article>

        <article className="card relative overflow-hidden p-8 ring-1 ring-gold-500/25">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 size-48 rounded-full bg-gold-500/10 blur-2xl"
          />
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">Premium</h3>
            <Badge tone="gold">
              <Crown size={12} /> Most popular
            </Badge>
          </div>
          <p className="mt-1 text-sm text-mist">For the student who is serious about the grade.</p>
          <p className="mt-6 text-4xl font-extrabold text-gold-400">
            {naira(PREMIUM_PRICE_NAIRA)}
            <span className="text-base font-medium text-mist"> / month</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Every question in every past paper",
              "Full worked explanations on all questions",
              "Unlimited timed mock exams",
              "Topic-by-topic performance breakdown",
              "Cancel anytime — no long contract",
            ].map((line) => (
              <li key={line} className="flex gap-2.5 text-mist">
                <Check size={17} className="mt-0.5 shrink-0 text-gold-400" />
                {line}
              </li>
            ))}
          </ul>
          <ButtonLink href="/signup" variant="gold" className="mt-8 w-full">
            Get Premium
          </ButtonLink>
        </article>
      </section>

      {/* -------------------------------------------------------- footer --- */}
      <footer className="mt-20 border-t border-leaf-500/10 pt-8 text-sm text-mist">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo size={26} />
          <p>Built for Nigerian students. Study hard, pass well.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="focus-ring rounded hover:text-chalk">
              Sign in
            </Link>
            <Link href="/signup" className="focus-ring rounded hover:text-chalk">
              Sign up
            </Link>
            <Link href="/terms" className="focus-ring rounded hover:text-chalk">
              Terms
            </Link>
            <Link href="/privacy" className="focus-ring rounded hover:text-chalk">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
