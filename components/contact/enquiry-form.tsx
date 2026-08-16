"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { ArrowRight, Card, Notice } from "@/components/ui/primitives";
import { opportunities } from "@/content/opportunities";
import { instruments } from "@/content/investing";
import { flags, site } from "@/content/site";

const fieldClass =
  "w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm text-text-primary transition-colors placeholder:text-text-muted focus:border-primary focus:outline-none";

const labelClass = "mb-2 block text-sm font-medium text-text-primary";

/**
 * Enquiry form.
 *
 * There is no backend yet, so submitting composes a pre-filled email to the
 * Green-X enquiries address. To wire this to a real inbox or CRM later,
 * replace `handleSubmit` with a POST to an API route — the field names below
 * are already the payload shape.
 */
export function EnquiryForm() {
  const searchParams = useSearchParams();
  const presetRound = searchParams.get("round") ?? "";

  const [sent, setSent] = useState(false);

  const selectableRounds = useMemo(
    () =>
      opportunities.filter(
        (o) =>
          (flags.showSampleDeals || !o.isSample) &&
          (o.status === "open" || o.status === "upcoming" || o.status === "pipeline"),
      ),
    [],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const lines = [
      `Name: ${data.get("name")}`,
      `Organisation: ${data.get("organisation") || "—"}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "—"}`,
      "",
      `Round of interest: ${data.get("round") || "Not specified"}`,
      `Preferred instrument: ${data.get("instrument") || "Not specified"}`,
      `Indicative amount: ${data.get("amount") || "Not specified"}`,
      "",
      "Message:",
      String(data.get("message") ?? ""),
    ];

    const subject = `Green-X enquiry — ${data.get("round") || "general"}`;
    const href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(lines.join("\n"))}`;

    window.location.href = href;
    setSent(true);
  }

  return (
    <Card className="p-7 sm:p-9">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="name">
              Full name <span className="text-accent">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className={fieldClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="organisation">
              Organisation
            </label>
            <input
              id="organisation"
              name="organisation"
              type="text"
              autoComplete="organization"
              className={fieldClass}
              placeholder="Company, fund or programme"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="email">
              Email <span className="text-accent">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={fieldClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              className={fieldClass}
              placeholder="+234 …"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="round">
              Round of interest
            </label>
            <select
              id="round"
              name="round"
              defaultValue={presetRound}
              className={fieldClass}
            >
              <option value="">General enquiry</option>
              {selectableRounds.map((o) => (
                <option key={o.code} value={o.code}>
                  {o.code} — {o.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="instrument">
              Preferred instrument
            </label>
            <select id="instrument" name="instrument" className={fieldClass}>
              <option value="">Not sure yet</option>
              {instruments.map((instrument) => (
                <option key={instrument.name} value={instrument.name}>
                  {instrument.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="amount">
            Indicative amount
          </label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="numeric"
            className={fieldClass}
            placeholder="₦ — an approximate figure is fine"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="message">
            Message <span className="text-accent">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className={`${fieldClass} resize-y`}
            placeholder="Tell us what you would like to know, or what you would need to see before committing."
          />
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-fg shadow-sm transition-all hover:bg-primary-hover hover:shadow-md active:scale-[0.99] sm:w-auto"
        >
          Send enquiry
          <ArrowRight />
        </button>

        {sent ? (
          <Notice tone="primary">
            Your email client should have opened with the enquiry pre-filled. If
            nothing happened, email us directly at{" "}
            <a
              href={`mailto:${site.email}`}
              className="font-medium underline underline-offset-4"
            >
              {site.email}
            </a>
            .
          </Notice>
        ) : (
          <p className="text-xs leading-6 text-text-muted">
            Submitting opens your email client with this enquiry pre-filled — no
            data is stored on this site. You can also write to{" "}
            <a
              href={`mailto:${site.email}`}
              className="underline underline-offset-4 hover:text-primary"
            >
              {site.email}
            </a>{" "}
            directly.
          </p>
        )}
      </form>
    </Card>
  );
}
