import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { footerNav, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-surface-invert text-text-inverted">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo tone="invert" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-text-inverted/60">
              {site.tagline}
            </p>
            <dl className="mt-7 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-text-inverted/40">Headquarters</dt>
                <dd className="text-text-inverted/80">{site.headquarters}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-text-inverted/40">Enquiries</dt>
                <dd>
                  <a
                    href={`mailto:${site.email}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {site.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerNav.map((group) => (
              <div key={group.heading}>
                <h2 className="text-[0.7rem] font-semibold tracking-[0.16em] text-text-inverted/40 uppercase">
                  {group.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-text-inverted/70 transition-colors hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="max-w-4xl text-xs leading-6 text-text-inverted/45">
            <strong className="font-semibold text-text-inverted/70">
              Important:
            </strong>{" "}
            Nothing on this site is an offer of securities or investment advice.
            Yield, price and revenue figures are conservative planning
            assumptions drawn from the Green-X business plan, not guarantees or
            forecasts of return. Agricultural investment carries real risk of
            partial or total capital loss. Any participation is subject to
            separately documented terms.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-xs text-text-inverted/45 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </p>
            <p>
              Plan of record: Green-X Farm 2.0 Master Plan ·{" "}
              {site.documentDate}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
