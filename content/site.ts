/**
 * Site-wide configuration.
 *
 * This is the single place to edit organisation details, navigation and the
 * global content flags. Nothing here requires a code change to update.
 */

export const site = {
  name: "Green-X Farm",
  legalName: "Green-X Farm",
  tagline: "Building a Nigerian agro-industrial group, one proven layer at a time.",
  description:
    "Green-X Farm is a youth-led Nigerian agribusiness building from disciplined dry-season tomato production toward aggregation, processing, distribution and export. Review open investment opportunities, the project pipeline and our development roadmap.",
  url: "https://greenxfarm.example",
  headquarters: "Abuja, Nigeria",
  founded: "2026",
  email: "invest@greenxfarm.example",
  phone: "+234 000 000 0000",
  documentDate: "August 2026",
} as const;

/**
 * Content flags.
 *
 * `showSampleDeals` controls every entry marked `isSample` across the site —
 * placeholder deals that demonstrate the layout of a completed round. Set this
 * to `false` the moment real closed rounds exist, and the platform will show
 * only verified history.
 */
export const flags = {
  showSampleDeals: true,
} as const;

export type NavItem = {
  href: string;
  label: string;
  description?: string;
};

export const primaryNav: NavItem[] = [
  {
    href: "/opportunities",
    label: "Opportunities",
    description: "Open, upcoming and closed investment rounds",
  },
  {
    href: "/projects",
    label: "Projects",
    description: "The pipeline we intend to launch",
  },
  {
    href: "/roadmap",
    label: "Roadmap",
    description: "Phase 0 through Phase V development plan",
  },
  {
    href: "/track-record",
    label: "Track record",
    description: "Completed cycles and reported outcomes",
  },
  {
    href: "/invest",
    label: "How to invest",
    description: "Instruments, process and reporting",
  },
  {
    href: "/about",
    label: "About",
    description: "Story, founders and governance",
  },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Invest",
    items: [
      { href: "/opportunities", label: "Investment opportunities" },
      { href: "/invest", label: "How to invest" },
      { href: "/track-record", label: "Track record" },
      { href: "/portal", label: "Investor room" },
    ],
  },
  {
    heading: "The business",
    items: [
      { href: "/about", label: "About Green-X" },
      { href: "/projects", label: "Project pipeline" },
      { href: "/roadmap", label: "Development roadmap" },
      { href: "/about#governance", label: "Ownership & governance" },
    ],
  },
  {
    heading: "Contact",
    items: [
      { href: "/contact", label: "Enquire about a round" },
      { href: "/contact#partner", label: "Partnership & sponsorship" },
      { href: "/about#founders", label: "Meet the founders" },
    ],
  },
];

/**
 * Headline figures used on the home page. Every one of these is a stated plan
 * or verified position from the master plan — none are trading results.
 */
export const headlineStats = [
  {
    value: "₦3M",
    label: "Open round",
    detail: "Koya dry-season tomato Cycle I",
  },
  {
    value: "1 ha",
    label: "Land secured",
    detail: "Koya, Masaka — previously cultivated",
  },
  {
    value: "20 t/ha",
    label: "Planning yield",
    detail: "Conservative assumption, not a guarantee",
  },
  {
    value: "₦400M",
    label: "Capital threshold",
    detail: "Retained before flagship estate development",
  },
] as const;

export const philosophy = [
  {
    title: "Capital before complexity",
    body: "We do not build expensive infrastructure before the underlying business has demonstrated demand and cash generation.",
  },
  {
    title: "Master before scaling",
    body: "Every new activity begins as a controlled pilot and expands only when its economics and operations are proven.",
  },
  {
    title: "Own the learning",
    body: "Expert advice is combined with direct operational experience. Founders remain hands-on in the field.",
  },
  {
    title: "Unit-level economics",
    body: "Each major activity is financially separated so it must demonstrate its own economics, and weak units are redesigned or stopped.",
  },
  {
    title: "Aggregation is strategic",
    body: "Where our own production is insufficient, we aggregate from qualified farmers under our own quality controls.",
  },
  {
    title: "Distribution is as important as production",
    body: "Growing a crop is half the business. Timing, buyer access and logistics decide whether it becomes cash.",
  },
] as const;

export const locations = [
  {
    place: "Abuja",
    role: "Corporate headquarters, strategy, commercial management, finance and eventual flagship fresh-produce distribution.",
    position: "Preferred headquarters",
  },
  {
    place: "Masaka / Koya axis",
    role: "Dry-season irrigation tomato pilot and future controlled tomato production base.",
    position: "Existing 1-hectare leased land",
  },
  {
    place: "Southern Kaduna",
    role: "Ginger production, farmer relationships, aggregation and a possible small processing/export hub.",
    position: "Pilot territory",
  },
  {
    place: "Lapai, Niger State",
    role: "Proposed flagship Green-X agricultural estate.",
    position: "Candidate long-term site",
  },
  {
    place: "Southern processing corridor",
    role: "Potential cocoa, avocado and other southern-origin crop aggregation, processing and export.",
    position: "Future — site to be researched",
  },
] as const;
