/**
 * Investment opportunities.
 *
 * Add, edit or remove entries here — the index page, detail pages, home page
 * and track record all read from this one array.
 *
 * IMPORTANT: entries with `isSample: true` are placeholders that exist only to
 * demonstrate how a completed round is presented. They render with a visible
 * "Sample" badge and disappear entirely when `flags.showSampleDeals` is set to
 * false in `content/site.ts`. Never present a sample entry to an investor as a
 * real closed round.
 */

export type OpportunityStatus = "open" | "upcoming" | "closed" | "pipeline";

export type Opportunity = {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  status: OpportunityStatus;
  /** Placeholder entry — see the note at the top of this file. */
  isSample?: boolean;
  crop: string;
  location: string;
  cycle: string;
  /** Total capital sought, in naira. */
  target: number;
  /** Capital committed to date, in naira. */
  committed: number;
  /** Smallest participation Green-X will administer, in naira. */
  ticketMin?: number;
  horizon: string;
  instruments: string[];
  summary: string[];
  useOfFunds?: { item: string; amount: number }[];
  assumptions?: { label: string; value: string; note?: string }[];
  advantages?: { label: string; detail: string }[];
  kpis?: { label: string; measure: string }[];
  risks?: { risk: string; mitigation: string }[];
  timeline?: { step: string; detail: string }[];
  /** Populated for `closed` rounds only. */
  outcome?: {
    closedOn: string;
    summary: string;
    metrics: { label: string; value: string }[];
  };
};

export const opportunities: Opportunity[] = [
  {
    slug: "koya-dry-season-tomato-cycle-i",
    code: "GX-T01",
    name: "Koya Dry-Season Tomato — Cycle I",
    tagline:
      "A properly capitalised one-hectare dry-season tomato cycle serving the Abuja/Nasarawa market corridor.",
    status: "open",
    crop: "Tomato",
    location: "Koya, Masaka axis — Nasarawa State",
    cycle: "Dry season 2026/27",
    target: 3_000_000,
    committed: 1_200_000,
    ticketMin: 250_000,
    horizon: "One production cycle — approximately five months to harvest close-out",
    instruments: [
      "Full project funding",
      "Partial funding alongside other participants",
      "Equipment or input sponsorship (irrigation, fertiliser, crop protection)",
      "Strategic partnership with commercial involvement",
    ],
    summary: [
      "Green-X is seeking ₦3,000,000 in catalytic capital to execute a full dry-season tomato cycle on approximately one hectare at Koya, in the Masaka axis of Nasarawa State.",
      "The land is already identified and has been previously cultivated by the founders, and the experienced growers who assisted with that cycle are known to us and available. The constraint is not access to land, labour or technical skill — it is sufficient working capital to carry the crop properly through to harvest.",
      "The round is deliberately bounded. It funds one repeatable cash-generating unit with a defined budget, a defined market and weekly cost and crop records, rather than the wider Green-X ambition.",
    ],
    useOfFunds: [
      { item: "Irrigation pump/engine, pipes, hoses and setup", amount: 400_000 },
      { item: "Seeds and planting materials", amount: 250_000 },
      { item: "Fertiliser and soil nutrition", amount: 600_000 },
      { item: "Crop protection", amount: 350_000 },
      { item: "Land preparation and field labour", amount: 300_000 },
      { item: "Farm labour and supervision", amount: 300_000 },
      { item: "Fuel and irrigation operation", amount: 300_000 },
      { item: "Accommodation, welfare and feeding support", amount: 200_000 },
      { item: "Harvest, packaging and transport", amount: 150_000 },
      { item: "Contingency and working capital", amount: 150_000 },
    ],
    assumptions: [
      {
        label: "Cultivated area",
        value: "≈ 1 hectare",
        note: "Existing plot at Koya, previously cultivated by the founders.",
      },
      {
        label: "Planning yield",
        value: "20 tonnes per hectare",
        note: "A conservative target assumption, not a guarantee. Results depend on variety, agronomy, weather, irrigation and disease pressure.",
      },
      {
        label: "Planning price",
        value: "₦50,000 per large basket",
        note: "Local basket capacity varies. The basket-to-tonnage conversion is being physically verified in the Masaka market before any final financial forecast is issued.",
      },
      {
        label: "Revenue basis",
        value: "Marketable output only",
        note: "Total harvest and marketable harvest are recorded separately so damaged or rejected fruit is never treated as revenue-producing output.",
      },
    ],
    advantages: [
      {
        label: "Land",
        detail: "Approximately 1 hectare already identified and leased at Koya, Masaka, with an existing relationship with the landholder.",
      },
      {
        label: "Experience",
        detail: "A previous cultivation attempt on this same site produced concrete, costly lessons that shape this budget.",
      },
      {
        label: "Technical support",
        detail: "Experienced tomato growers already known to the founders handle day-to-day field management.",
      },
      {
        label: "Market access",
        detail: "Abuja and Nasarawa wholesalers, market women, retailers, restaurants and direct farm-gate buyers.",
      },
      {
        label: "Management",
        detail: "Founders remain hands-on, with direct site supervision through the cycle.",
      },
      {
        label: "Scalability",
        detail: "A verified cycle can be repeated and expanded without redesigning the operating model.",
      },
    ],
    kpis: [
      { label: "Cultivated area", measure: "Hectares actually planted" },
      { label: "Yield", measure: "Total tonnes harvested" },
      { label: "Marketable yield", measure: "Tonnes successfully sold" },
      { label: "Average price", measure: "Realised selling price per unit" },
      { label: "Revenue", measure: "Actual sales collected" },
      { label: "Production cost", measure: "Verified expenditure against budget" },
      { label: "Gross margin", measure: "Revenue less direct costs" },
      { label: "Reinvestment", measure: "Amount retained for the next cycle" },
    ],
    risks: [
      {
        risk: "Water failure",
        mitigation: "Pump system tested before planting; fuel and repair reserve maintained throughout the cycle.",
      },
      {
        risk: "Pests and disease",
        mitigation: "Experienced growers on site with a scheduled crop-protection programme and regular monitoring.",
      },
      {
        risk: "Price decline",
        mitigation: "Multiple buyer channels and progressive selling rather than a single bulk sale at one price point.",
      },
      {
        risk: "Input shortage",
        mitigation: "Critical inputs procured before they become urgent, not at the point of need.",
      },
      {
        risk: "Labour disruption",
        mitigation: "Relationships maintained with experienced growers plus backup labour arrangements.",
      },
      {
        risk: "Post-harvest loss",
        mitigation: "Harvest coordinated with confirmed buyers and transport so fruit moves quickly.",
      },
      {
        risk: "Capital diversion",
        mitigation: "Project funds ring-fenced and recorded; expenditure evidence available to funders.",
      },
    ],
    timeline: [
      { step: "01 — Confirm land", detail: "Confirm land access and terms with the landholder." },
      { step: "02 — Confirm growers", detail: "Confirm experienced growers and allocate responsibilities." },
      { step: "03 — Irrigation", detail: "Purchase and test the pump, engine, pipes and hoses before planting." },
      { step: "04 — Land and nursery", detail: "Prepare land and establish the nursery." },
      { step: "05 — Inputs", detail: "Procure seeds, fertiliser and crop protection against current quotations." },
      { step: "06 — Establishment", detail: "Establish the crop and begin the scheduled irrigation and fertilisation programme." },
      { step: "07 — Monitoring", detail: "Monitor crop health and expenditure weekly against budget." },
      { step: "08 — Buyers", detail: "Develop buyer relationships before peak harvest." },
      { step: "09 — Harvest", detail: "Harvest progressively and sell through multiple channels." },
      { step: "10 — Report", detail: "Prepare the post-cycle production and financial report." },
      { step: "11 — Reinvest", detail: "Reinvest an agreed portion of proceeds into the next cycle." },
    ],
  },
  {
    slug: "southern-kaduna-ginger-pilot",
    code: "GX-G01",
    name: "Southern Kaduna Ginger — Pilot Cycle",
    tagline:
      "A one-hectare controlled ginger cycle run as both a production test and a market-intelligence exercise.",
    status: "upcoming",
    crop: "Ginger",
    location: "Southern Kaduna",
    cycle: "Opens after Cycle I close-out",
    target: 4_500_000,
    committed: 0,
    ticketMin: 500_000,
    horizon: "One production cycle plus a fresh-versus-dried market comparison period",
    instruments: [
      "Partial funding alongside other participants",
      "Input and land-rental sponsorship",
      "Strategic partnership with offtake interest",
    ],
    summary: [
      "The second leg of the capital-building stage is approximately one hectare of ginger in Southern Kaduna, run as a controlled first cycle.",
      "Land is rented rather than purchased during the learning stage. Part of the harvest is sold fresh and part is processed into dried ginger, so the two markets can be compared with real numbers rather than assumptions.",
      "The cycle also builds the farmer relationships that later make aggregation possible. Scale-up follows only when production economics and market conditions justify additional capital.",
    ],
    assumptions: [
      { label: "Cultivated area", value: "≈ 1 hectare", note: "Controlled first-cycle test, land rented not purchased." },
      { label: "Market split", value: "Fresh and dried", note: "Deliberately split so both channels can be measured against each other." },
      { label: "Purpose", value: "Production and market intelligence", note: "The first cycle is treated as a learning exercise with a commercial return, not a scale play." },
    ],
    risks: [
      { risk: "Unverified cost base", mitigation: "Southern Kaduna ginger costs, yields, disease risk, land rental and post-harvest economics are being researched before capital is committed." },
      { risk: "Market uncertainty", mitigation: "Fresh and dried channels tested in parallel within the same cycle." },
      { risk: "Scale temptation", mitigation: "Hard rule — no expansion on revenue alone; only on verified margins." },
    ],
  },
  {
    slug: "koya-tomato-cycle-ii-expansion",
    code: "GX-T02",
    name: "Koya Tomato — Cycle II Expansion",
    tagline:
      "Repeat and expand the tomato engine, conditional on verified Cycle I economics.",
    status: "upcoming",
    crop: "Tomato",
    location: "Masaka / Koya axis — Nasarawa State",
    cycle: "Dry season following a successful Cycle I",
    target: 7_500_000,
    committed: 0,
    ticketMin: 500_000,
    horizon: "One expanded production cycle",
    instruments: [
      "Partial funding alongside other participants",
      "Reinvestment alongside Cycle I participants",
      "Equipment sponsorship",
    ],
    summary: [
      "Cycle II expands the tomato operation onto additional hectarage on the same axis, using the irrigation infrastructure and grower relationships established in Cycle I.",
      "This round does not open on ambition. It opens only when Cycle I has produced a verified production and financial report showing margins that justify additional capital — expansion follows evidence, not enthusiasm.",
      "Ugu and okra are used as supporting crops within the cycle rather than as independent businesses.",
    ],
    assumptions: [
      { label: "Trigger", value: "Verified Cycle I margins", note: "Published post-cycle production and financial report is the precondition for opening this round." },
      { label: "Reused assets", value: "Irrigation and grower network", note: "Cycle I capital expenditure carries into Cycle II, improving the cost base." },
    ],
  },
  {
    slug: "ginger-handling-and-drying-hub",
    code: "GX-H01",
    name: "Southern Kaduna Ginger Handling & Drying Hub",
    tagline:
      "A small receiving, cleaning, drying and quality-control facility — buyer-first, built only when export demand is credible.",
    status: "pipeline",
    crop: "Ginger — processing and export",
    location: "Southern Kaduna",
    cycle: "Phase I, subject to buyer commitments",
    target: 35_000_000,
    committed: 0,
    horizon: "Infrastructure investment with multi-cycle payback",
    instruments: [
      "Structured infrastructure financing",
      "Strategic partnership",
      "Offtake-linked participation",
    ],
    summary: [
      "If volume, quality, buyer demand and regulatory requirements justify it, Green-X may establish a small ginger handling and processing hub in Southern Kaduna ahead of the flagship Niger State estate.",
      "Scope covers a receiving and storage facility, cleaning, sorting and drying capability matched to buyer specifications, quality control, packaging and traceability, and the Nigerian export registrations required before commercial export.",
      "The discipline here is buyer-first: credible international buyers and written specifications come before major infrastructure spending, not after it.",
    ],
    risks: [
      { risk: "Building ahead of demand", mitigation: "No construction before buyer specifications and credible purchase interest are documented." },
      { risk: "Specification mismatch", mitigation: "Drying and grading capability sized to actual buyer moisture, contamination and grading requirements." },
      { risk: "Regulatory delay", mitigation: "Export registrations and certifications completed in parallel with, not after, facility development." },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Closed rounds                                                       */
  /* ------------------------------------------------------------------ */

  {
    slug: "founders-self-funded-tomato-trial",
    code: "GX-T00",
    name: "Founders' Self-Funded Tomato Trial",
    tagline:
      "The undercapitalised cycle that produced the single most valuable lesson in this business plan.",
    status: "closed",
    crop: "Tomato",
    location: "Koya, Masaka axis — Nasarawa State",
    cycle: "Prior dry season",
    target: 800_000,
    committed: 800_000,
    horizon: "Completed",
    instruments: ["Founder capital"],
    summary: [
      "Before seeking any external capital, the founders attempted tomato cultivation on the Koya plot with roughly ₦800,000 of their own money.",
      "It was not enough. The crop did not receive sufficient irrigation and fertilisation through the cycle, and the financial result was disappointing.",
      "We publish this because it is the reason the current round is structured the way it is. The principal lesson — that tomato farming should not be entered without enough operating capital to finish the crop properly — is now a precondition of the Green-X model rather than an observation about the past.",
    ],
    outcome: {
      closedOn: "Prior dry season",
      summary:
        "Closed below expectation. Root cause identified as undercapitalisation at the exact stage the crop required inputs most. Directly informed the ₦3,000,000 Cycle I budget and the ring-fencing discipline now applied to project funds.",
      metrics: [
        { label: "Capital deployed", value: "≈ ₦800,000" },
        { label: "Source", value: "Founder capital" },
        { label: "Financial result", value: "Below target" },
        { label: "Primary cause", value: "Insufficient working capital" },
        { label: "Carried forward", value: "Full-cycle budgeting, ring-fenced funds, weekly records" },
      ],
    },
  },
  {
    slug: "cycle-i-anchor-tranche",
    code: "GX-T01A",
    name: "Cycle I Anchor Tranche",
    tagline:
      "First tranche of the Koya Cycle I round, closed with an early participant.",
    status: "closed",
    isSample: true,
    crop: "Tomato",
    location: "Koya, Masaka axis — Nasarawa State",
    cycle: "Dry season 2026/27",
    target: 1_200_000,
    committed: 1_200_000,
    horizon: "One production cycle",
    instruments: ["Partial funding"],
    summary: [
      "Anchor tranche of the ₦3,000,000 Koya Cycle I round, allocated to irrigation setup, seeds and the opening fertiliser schedule.",
      "Funds ring-fenced to the Cycle I project account with expenditure recorded against the published line-item budget.",
    ],
    outcome: {
      closedOn: "Sample entry",
      summary:
        "Tranche fully subscribed and drawn against irrigation and early-stage input procurement, with weekly expenditure records issued to the participant.",
      metrics: [
        { label: "Tranche size", value: "₦1,200,000" },
        { label: "Allocation", value: "Irrigation · seeds · opening fertiliser" },
        { label: "Reporting", value: "Weekly cost and crop records" },
        { label: "Status", value: "Fully subscribed" },
      ],
    },
  },
  {
    slug: "irrigation-equipment-sponsorship",
    code: "GX-EQ01",
    name: "Irrigation Equipment Sponsorship",
    tagline:
      "In-kind sponsorship of the pump, engine, pipes and hoses for the Koya plot.",
    status: "closed",
    isSample: true,
    crop: "Infrastructure",
    location: "Koya, Masaka axis — Nasarawa State",
    cycle: "Dry season 2026/27",
    target: 400_000,
    committed: 400_000,
    horizon: "Capital asset — carries across multiple cycles",
    instruments: ["Equipment sponsorship"],
    summary: [
      "Sponsorship covering the irrigation pump and engine, pipes, hoses and installation for the one-hectare Koya plot.",
      "Equipment sponsorship is attractive because the asset carries forward: it serves Cycle I and every subsequent cycle on the same plot rather than being consumed within one season.",
    ],
    outcome: {
      closedOn: "Sample entry",
      summary:
        "Equipment procured, installed and pressure-tested before planting, with supplier invoices and photographic evidence provided to the sponsor.",
      metrics: [
        { label: "Sponsorship value", value: "₦400,000" },
        { label: "Asset", value: "Pump, engine, pipes, hoses" },
        { label: "Useful life", value: "Multiple cycles" },
        { label: "Verification", value: "Invoices and installation evidence" },
      ],
    },
  },
  {
    slug: "harvest-logistics-facility",
    code: "GX-LOG01",
    name: "Harvest Logistics Facility",
    tagline:
      "Short-cycle working capital covering harvest, packaging and transport to Abuja buyers.",
    status: "closed",
    isSample: true,
    crop: "Logistics",
    location: "Masaka — Abuja corridor",
    cycle: "Dry season 2026/27",
    target: 450_000,
    committed: 450_000,
    horizon: "Harvest window — approximately eight weeks",
    instruments: ["Short-cycle working capital"],
    summary: [
      "A short-duration facility funding harvest labour, packaging and transport into the Abuja and Nasarawa markets during the harvest window.",
      "Post-harvest loss is one of the largest controllable risks in fresh tomato production. Funding movement properly is what converts a good field result into collected cash.",
    ],
    outcome: {
      closedOn: "Sample entry",
      summary:
        "Facility drawn across the harvest window and repaid from sales proceeds as fruit was progressively sold through wholesale and direct farm-gate channels.",
      metrics: [
        { label: "Facility size", value: "₦450,000" },
        { label: "Tenor", value: "≈ 8 weeks" },
        { label: "Purpose", value: "Harvest · packaging · transport" },
        { label: "Repayment", value: "From progressive sales proceeds" },
      ],
    },
  },
];

/* ---------------------------------------------------------------- */
/* Selectors                                                         */
/* ---------------------------------------------------------------- */

/** Every opportunity visible under the current content flags. */
export function visibleOpportunities(showSampleDeals: boolean): Opportunity[] {
  return opportunities.filter((o) => showSampleDeals || !o.isSample);
}

export function byStatus(
  list: Opportunity[],
  status: OpportunityStatus,
): Opportunity[] {
  return list.filter((o) => o.status === status);
}

export function findOpportunity(slug: string): Opportunity | undefined {
  return opportunities.find((o) => o.slug === slug);
}

export const statusLabels: Record<OpportunityStatus, string> = {
  open: "Open",
  upcoming: "Upcoming",
  closed: "Closed",
  pipeline: "Pipeline",
};

export const statusDescriptions: Record<OpportunityStatus, string> = {
  open: "Accepting commitments now",
  upcoming: "Opens once its precondition is met",
  closed: "Fully subscribed — no longer accepting commitments",
  pipeline: "Under research; not yet costed for investment",
};
