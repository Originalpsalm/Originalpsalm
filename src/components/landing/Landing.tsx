import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { LogoMark } from "@/components/Logo";
import { naira } from "@/components/ui";
import type { SpeedTier } from "@/lib/content-constants";
import { EXAM_BODIES } from "@/lib/types";
import { HeroHeadline } from "./HeroHeadline";
import { RiseIn } from "./RiseIn";
import { TryQuestion } from "./TryQuestion";
import "./landing.css";

import aminaPractise from "./art/amina-practise.webp";
import castWalk from "./art/cast-walk.webp";
import chidinmaRealise from "./art/chidinma-realise.webp";
import classTable from "./art/class-table.webp";
import emekaThink from "./art/emeka-think.webp";
import heroWelcome from "./art/hero-welcome.webp";
import tobiRun from "./art/tobi-run.webp";

export type LandingProps = {
  /** How many of the most recent years are free per subject (admin setting). */
  freeYears: number;
  /** The timed-test tiers, as configured by the admin. */
  tiers: SpeedTier[];
  /** Premium prices in naira: one month, and the 3- and 6-month bundles. */
  prices: { monthly: number; threeMonths: number; sixMonths: number };
};

/** Per-illustration timing for the gentle wiggle, so no two move in step. */
function wiggle(duration: string, delay = "0s"): CSSProperties {
  return { "--wiggle-dur": duration, "--wiggle-delay": delay } as CSSProperties;
}

/** "10", "20 and 40", "10, 20 and 40". */
function listOf(values: number[]): string {
  if (values.length <= 1) return values.join("");
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      className="lp-check"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Brand({ size }: { size: number }) {
  return (
    <>
      <LogoMark size={size} />
      <span className="lp-brand-word">
        <span className="lp-brand-name" style={{ fontSize: size * 0.61 }}>
          GURU
        </span>
        <span className="lp-brand-sub">point</span>
      </span>
    </>
  );
}

export function Landing({ freeYears, tiers, prices }: LandingProps) {
  const freeTiers = tiers.filter((tier) => !tier.premium).map((tier) => tier.count);
  const premiumTiers = tiers.filter((tier) => tier.premium).map((tier) => tier.count);
  const freeYearsLine =
    freeYears === 1
      ? "The most recent year of every subject"
      : `The ${freeYears} most recent years of every subject`;
  const faqFreeLine =
    freeYears === 1
      ? "the most recent year of every subject"
      : `the ${freeYears} most recent years of every subject`;
  // ₦2,000 a month is about ₦460 a week — rounded up to the next ₦100.
  const weekly = Math.ceil((prices.monthly * 12) / 52 / 100) * 100;

  return (
    <div className="lp" id="top">
      {/* React hoists these into <head>: the two faces above the fold are
          fetched straight away instead of after the stylesheet is parsed. */}
      <link
        rel="preload"
        href="/fonts/bricolage-grotesque-latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/plus-jakarta-sans-latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <RiseIn />

      {/* ------------------------------------------------------- header --- */}
      <header className="lp-header">
        <div className="lp-header-in">
          <Link href="/" className="lp-brand" aria-label="GURU home">
            <Brand size={36} />
          </Link>
          <nav className="lp-nav" aria-label="Sections">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#try">Try a question</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lp-header-cta">
            <Link href="/login" className="lp-btn lp-btn--text lp-btn--sm">
              Sign in
            </Link>
            <Link href="/signup" className="lp-btn lp-btn--ink lp-btn--sm">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ------------------------------------------------------- hero --- */}
        <section className="lp-hero" aria-labelledby="lp-hero-title">
          <div className="lp-hero-card">
            <div className="lp-hero-blob" aria-hidden="true" />
            <div className="lp-hero-copy">
              <HeroHeadline />
            </div>
            <div className="lp-hero-art">
              <Image
                src={heroWelcome}
                alt="Tobi sits on a stack of books with his laptop open while Amina stands beside him with her phone, waving hello"
                priority
                sizes="(max-width: 900px) 92vw, 540px"
                className="lp-wiggle"
                style={wiggle("6s")}
              />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------- exam row --- */}
        <section className="lp-exams lp-rise" aria-label="Exams covered">
          <p className="lp-eyebrow">Past questions for</p>
          <div className="lp-pills">
            {EXAM_BODIES.map((body) => (
              <span key={body.id} className="lp-pill lp-display" title={body.full}>
                {body.name}
              </span>
            ))}
          </div>
        </section>

        {/* ------------------------------------------- every answer explained --- */}
        <section className="lp-section lp-feature lp-rise" id="features">
          <div className="lp-feature-art">
            <Image
              src={chidinmaRealise}
              alt="Chidinma at her desk, pointing up as the answer clicks, with a green tick above her exercise book"
              sizes="(max-width: 700px) 60vw, 320px"
              className="lp-wiggle"
              style={wiggle("7s", "-1s")}
            />
          </div>
          <div className="lp-feature-copy">
            <h2 className="lp-h2">Every answer explained, not just the letter.</h2>
            <p className="lp-muted">
              When GURU marks your paper, each question shows the working. Learn the method once
              and the next question gets easier.
            </p>
            <div className="lp-sample" aria-label="Example of a marked question">
              <p className="lp-sample-q">Find the median of 4, 7, 2, 9, 5 and 8.</p>
              <div className="lp-sample-rows">
                <div className="lp-sample-row lp-sample-row--right">
                  <span className="lp-sample-key">B</span>
                  <span>6</span>
                  <span className="lp-sample-tag">Correct</span>
                </div>
                <div className="lp-sample-row lp-sample-row--wrong">
                  <span className="lp-sample-key">C</span>
                  <span>6.5</span>
                  <span className="lp-sample-tag">Your answer</span>
                </div>
              </div>
              <p className="lp-sample-how">
                <strong>How it is solved: </strong>Arrange them: 2, 4, 5, 7, 8, 9. The middle two
                are 5 and 7, so the median is 6.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ study together --- */}
        <section className="lp-section lp-class lp-rise" aria-labelledby="lp-class-title">
          <div className="lp-class-copy">
            <h2 className="lp-h2" id="lp-class-title">
              Study with your class, not alone.
            </h2>
            <p className="lp-muted">
              Create a study group, share its code in your class chat, and work through the hard
              questions together.
            </p>
            <div className="lp-invite" aria-label="Example invite code">
              <span className="lp-invite-label">Invite code</span>
              <span className="lp-invite-code">GURU01</span>
            </div>
          </div>
          <div className="lp-class-art">
            <div className="lp-table lp-wiggle" style={wiggle("8s", "-4s")}>
              <Image
                src={classTable}
                alt="Tobi, Amina, Emeka and Chidinma around a table with a laptop, a phone and an open exercise book, talking through a question"
                fill
                sizes="(max-width: 700px) 92vw, 600px"
              />
              <p
                className="lp-bubble"
                aria-hidden="true"
                style={{ left: "17.06%", top: "7.91%", width: "15.95%", height: "12.54%" }}
              >
                How did you get Q4?
              </p>
              <p
                className="lp-bubble"
                aria-hidden="true"
                style={{ left: "45.57%", top: "5.04%", width: "17.97%", height: "13.16%" }}
              >
                Arrange them first
              </p>
              <p
                className="lp-bubble"
                aria-hidden="true"
                style={{ left: "80.21%", top: "14.08%", width: "14%", height: "11.51%" }}
              >
                So it&rsquo;s 6!
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ how it works --- */}
        <section className="lp-section lp-rise" id="how" aria-labelledby="lp-how-title">
          <div className="lp-paper">
            <div className="lp-paper-margin" aria-hidden="true" />
            <h2 className="lp-paper-title" id="lp-how-title">
              How GURU works
            </h2>
            <ol className="lp-steps">
              {[
                {
                  title: "Pick a paper",
                  body: "Choose your exam, subject and year, then answer real past questions under exam timing.",
                  shape: "52% 48% 55% 45%",
                  tilt: "-6deg",
                },
                {
                  title: "See the working",
                  body: "GURU marks your paper and shows how every answer is reached, then lists the topics to revise.",
                  shape: "45% 55% 48% 52%",
                  tilt: "4deg",
                },
                {
                  title: "Bring your class",
                  body: "Share a 6-letter code and work through the hard ones together in your study group.",
                  shape: "55% 45% 50% 50%",
                  tilt: "-3deg",
                },
              ].map((step, index) => (
                <li key={step.title} className="lp-step">
                  <span
                    className="lp-step-num"
                    aria-hidden="true"
                    style={{ borderRadius: step.shape, transform: `rotate(${step.tilt})` }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Image
              src={aminaPractise}
              alt="Amina sitting cross-legged, answering questions on her phone with a stopwatch beside her"
              sizes="(max-width: 700px) 150px, 320px"
              className="lp-paper-art lp-wiggle"
              style={wiggle("7s", "-2s")}
            />
          </div>
        </section>

        {/* ----------------------------------------------- try a question --- */}
        <section className="lp-try lp-rise" id="try" aria-labelledby="lp-try-title">
          <div className="lp-try-in">
            <div className="lp-try-head">
              <h2 className="lp-h2" id="lp-try-title">
                Try a real question.
              </h2>
              <p className="lp-muted">From WAEC Mathematics 2023. Pick an answer to see how it is solved.</p>
            </div>
            <div className="lp-quiz">
              <Image
                src={emekaThink}
                alt="Emeka sitting cross-legged, tapping a pencil on his chin and thinking"
                sizes="(max-width: 700px) 112px, 200px"
                className="lp-quiz-art lp-wiggle"
                style={wiggle("6.5s", "-2.5s")}
              />
              <TryQuestion />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------- speed mode --- */}
        <section className="lp-section lp-speed lp-rise" aria-labelledby="lp-speed-title">
          <div className="lp-speed-copy">
            <Image
              src={tobiRun}
              alt="Tobi running with his laptop under his arm, racing a big stopwatch"
              sizes="(max-width: 700px) 150px, 230px"
              className="lp-wiggle"
              style={wiggle("2.2s")}
            />
            <div className="lp-speed-text">
              <h2 className="lp-h2" id="lp-speed-title">
                Beat the clock.
              </h2>
              <p className="lp-muted">
                Speed Mode gives you random questions under real exam timing, so exam day is not
                the first time you feel the pressure.
              </p>
            </div>
          </div>
          <div className="lp-tiers">
            {tiers.map((tier) => (
              <div key={tier.count} className="lp-tier">
                <p className="lp-tier-num lp-display">{tier.count}</p>
                <p className="lp-tier-label">
                  questions in {tier.minutes} {tier.minutes === 1 ? "minute" : "minutes"}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------ pricing --- */}
        <section className="lp-section lp-rise" id="pricing" aria-labelledby="lp-pricing-title">
          <div className="lp-pricing-head">
            <h2 className="lp-h2" id="lp-pricing-title">
              Start free. Upgrade when you are ready.
            </h2>
            <p className="lp-muted">No card needed to start. Premium payments go through Paystack.</p>
          </div>
          <div className="lp-plans">
            <article className="lp-plan">
              <div className="lp-plan-head">
                <h3>Free</h3>
              </div>
              <p className="lp-price">
                <span className="lp-price-num lp-display">{naira(0)}</span>
              </p>
              <p className="lp-plan-note">Enough to see if GURU works for you.</p>
              <ul>
                <li>
                  <CheckIcon color="#0b7a44" />
                  {freeYearsLine}
                </li>
                <li>
                  <CheckIcon color="#0b7a44" />
                  Worked answers on every question you open
                </li>
                <li>
                  <CheckIcon color="#0b7a44" />
                  Study groups and group chat
                </li>
                {freeTiers.length > 0 && (
                  <li>
                    <CheckIcon color="#0b7a44" />
                    {listOf(freeTiers)}-question Speed Mode
                  </li>
                )}
              </ul>
              <Link href="/signup" className="lp-btn lp-btn--outline lp-btn--block">
                Start free
              </Link>
            </article>

            <article className="lp-plan lp-plan--premium">
              <div className="lp-plan-head">
                <h3>Premium</h3>
                <span className="lp-plan-badge">Under {naira(weekly)} a week</span>
              </div>
              <p className="lp-price">
                <span className="lp-price-num lp-display">{naira(prices.monthly)}</span>
                <span className="lp-price-per">/ month</span>
              </p>
              <p className="lp-plan-note">
                Or {naira(prices.threeMonths)} for 3 months and {naira(prices.sixMonths)} for 6.
              </p>
              <ul>
                <li>
                  <CheckIcon color="#17c471" />
                  Every past year of every subject
                </li>
                <li>
                  <CheckIcon color="#17c471" />
                  Worked answers on every question
                </li>
                {premiumTiers.length > 0 && (
                  <li>
                    <CheckIcon color="#17c471" />
                    {listOf(premiumTiers)}-question Speed Mode
                  </li>
                )}
                <li>
                  <CheckIcon color="#17c471" />
                  Nothing renews without you
                </li>
              </ul>
              <Link href="/signup" className="lp-btn lp-btn--green lp-btn--block">
                Get Premium
              </Link>
            </article>
          </div>
        </section>

        {/* ---------------------------------------------------------- FAQ --- */}
        <section className="lp-section lp-faq lp-rise" id="faq" aria-labelledby="lp-faq-title">
          <div className="lp-faq-title">
            <h2 className="lp-h2" id="lp-faq-title">
              Questions, answered
            </h2>
          </div>
          <div className="lp-faq-list">
            {[
              {
                q: "Is GURU really free?",
                a: `Yes. A free account opens ${faqFreeLine}, with every answer explained. Premium opens every older year.`,
                open: true,
              },
              {
                q: "Can I use it on my phone and my laptop?",
                a: "Yes. GURU runs in any browser. On a phone, Add to Home screen gives you an icon that opens full-screen like an app.",
              },
              {
                q: "How do I pay for Premium?",
                a: "Inside GURU, through Paystack. Choose 1, 3 or 6 months. Nothing renews automatically.",
              },
              {
                q: "Can I share my account?",
                a: "No. Each account is for one student on a limited number of devices. That is how we keep the price low for everybody.",
              },
              {
                q: "Is the group chat safe?",
                a: "The GURU team reviews group messages for bullying, spam and exam-malpractice offers, and removes anything that breaks the rules.",
              },
            ].map((item) => (
              <details key={item.q} className="lp-faq-item" open={item.open}>
                <summary>
                  {item.q}
                  <span className="lp-faq-plus" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------- final CTA --- */}
        <section className="lp-cta lp-rise" aria-labelledby="lp-cta-title">
          <div className="lp-cta-card">
            <div className="lp-cta-copy">
              <h2 className="lp-cta-title" id="lp-cta-title">
                Exam day is coming. Start practising today.
              </h2>
              <Link href="/signup" className="lp-btn lp-btn--ink lp-btn--lg">
                Start free
                <ArrowIcon />
              </Link>
            </div>
            <div className="lp-cta-art">
              <Image
                src={castWalk}
                alt="Tobi, Amina, Chidinma and Emeka walking side by side with their school bags, ready for the exam"
                sizes="(max-width: 900px) 92vw, 600px"
                className="lp-wiggle"
                style={wiggle("7.5s", "-3s")}
              />
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------- footer --- */}
      <footer className="lp-footer">
        <div className="lp-footer-row">
          <div className="lp-footer-brand">
            <Link href="/" className="lp-brand" aria-label="GURU home">
              <Brand size={30} />
            </Link>
            <p>Past questions, worked answers and study groups for Nigerian students.</p>
          </div>
          <nav className="lp-footer-nav" aria-label="Footer">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link href="/login">Sign in</Link>
            <Link href="/signup">Sign up</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
        <p className="lp-copyright">© {new Date().getFullYear()} GURU</p>
      </footer>
    </div>
  );
}
