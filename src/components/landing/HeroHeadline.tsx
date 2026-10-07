"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * The hero's two headlines. They share one spot: the active one sits still
 * while the other waits off-screen, so a change slides one out to the left
 * and the next in from the right. It advances on its own every six seconds
 * until a visitor picks one with the dots (or asks for reduced motion).
 */

const SLIDES = [
  {
    title: (
      <>
        Welcome to GURU. Let&rsquo;s get you <span className="lp-mark">exam-ready.</span>
      </>
    ),
    lede: "Real WAEC, JAMB, NECO and NABTEB past questions, every answer explained, and your class beside you. On your phone or your laptop.",
  },
  {
    title: (
      <>
        Past questions, <span className="lp-mark">finally explained.</span>
      </>
    ),
    lede: "Real past papers with the working behind every answer, and a study group for your class. On your phone or your laptop.",
  },
];

const INTERVAL_MS = 6000;

export function HeroHeadline() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      // Background tabs keep the clock but skip the change, so a visitor
      // never comes back to a headline mid-slide.
      if (document.visibilityState === "visible") {
        setActive((current) => (current + 1) % SLIDES.length);
      }
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [auto]);

  return (
    <>
      <div className="lp-hero-stack">
        {SLIDES.map((slide, index) => {
          const isActive = index === active;
          // Only the first headline is the page's <h1>; the second is the
          // same words in a different order, not a second page title.
          const Title = index === 0 ? "h1" : "p";
          return (
            <div
              key={index}
              className="lp-hero-slide"
              data-active={isActive ? "true" : "false"}
              data-dir={index === 0 ? "left" : "right"}
              aria-hidden={!isActive}
            >
              <Title className="lp-hero-title lp-display" id={index === 0 ? "lp-hero-title" : undefined}>
                {slide.title}
              </Title>
              <p className="lp-hero-lede">{slide.lede}</p>
            </div>
          );
        })}
      </div>

      <div className="lp-hero-actions">
        <Link href="/signup" className="lp-btn lp-btn--ink lp-btn--lg">
          Start free
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
        </Link>
        <Link href="/login" className="lp-btn lp-btn--glass lp-btn--lg">
          Sign in
        </Link>
      </div>

      <div className="lp-dots" role="group" aria-label="Choose a headline">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            className="lp-dot"
            aria-pressed={index === active}
            aria-label={`Headline ${index + 1} of ${SLIDES.length}`}
            onClick={() => {
              setActive(index);
              setAuto(false);
            }}
          >
            <span />
          </button>
        ))}
      </div>
    </>
  );
}
