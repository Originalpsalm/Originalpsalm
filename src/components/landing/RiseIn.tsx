"use client";

import { useEffect } from "react";

/**
 * Fallback for the rise-in-on-scroll effect.
 *
 * landing.css drives the effect from the scroll position itself wherever the
 * browser supports scroll-driven animations. Where it does not (older
 * browsers, Firefox before 2025), this watches each section instead and
 * reveals it the first time it scrolls into view. Sections that are already
 * on screen when the page loads are left alone, and a reduced-motion
 * preference turns the whole thing off. Renders nothing.
 */
export function RiseIn() {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    const sections = document.querySelectorAll<HTMLElement>(".lp-rise");
    for (const section of sections) {
      if (section.getBoundingClientRect().top < window.innerHeight) continue;
      section.classList.add("lp-rise--js");
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
