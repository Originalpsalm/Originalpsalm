/**
 * Development phases, the ₦400m capital threshold and the five-year vision.
 */

export type Phase = {
  id: string;
  name: string;
  objective: string;
  detail: string[];
  status: "current" | "next" | "future";
};

export const phases: Phase[] = [
  {
    id: "Phase 0",
    name: "Capital & Market Validation",
    objective:
      "Build starting capital, execute the Masaka/Koya tomato cycle, establish records and prepare Southern Kaduna ginger relationships.",
    detail: [
      "Execute a properly capitalised one-hectare dry-season tomato cycle.",
      "Establish production and financial records from day one.",
      "Map tomato buyers before harvest rather than after it.",
      "Begin Southern Kaduna ginger planning early enough to secure land and labour.",
    ],
    status: "current",
  },
  {
    id: "Phase I",
    name: "Cash Engine & Export Readiness",
    objective:
      "Scale successful tomato cycles, cautiously expand ginger, develop aggregation and prepare export compliance.",
    detail: [
      "Repeat and expand tomato cycles on verified margins only.",
      "Run the first ginger cycle as a production and market-learning exercise.",
      "Develop aggregation relationships with qualified farmers.",
      "Begin export-market research and regulatory preparation before any commercial shipment.",
      "Establish a small ginger handling and processing facility if buyer demand justifies it.",
    ],
    status: "next",
  },
  {
    id: "Phase II",
    name: "Green-X Estate Establishment",
    objective:
      "After approximately ₦400m in retained capital, secure long-term land around Lapai and develop initial estate infrastructure.",
    detail: [
      "Investigate long-term lease or lease-to-own structures before outright purchase.",
      "Develop about 10 hectares initially rather than the whole estate.",
      "Build essential administration, staff facilities, warehousing and basic post-harvest handling.",
      "Reserve space for future orchard and processing expansion.",
    ],
    status: "future",
  },
  {
    id: "Phase III",
    name: "Processing & Agro-Industrial Expansion",
    objective:
      "Scale ginger, shea and cocoa aggregation, establish processing where supply and demand justify it, and expand logistics.",
    detail: [
      "Move progressively from raw aggregation into refined products where margin is durable.",
      "Develop the avocado and cashew orchard pathways.",
      "Expand logistics capacity from third-party transport toward an owned fleet.",
    ],
    status: "future",
  },
  {
    id: "Phase IV",
    name: "Integrated Agricultural Group",
    objective:
      "Expand production, processing, export, poultry, aquaculture and selected livestock, and strengthen regional supply networks.",
    detail: [
      "Operate production, aggregation, processing, logistics, distribution and export as one group.",
      "Track every livestock and crop unit as a distinct economic unit.",
    ],
    status: "future",
  },
  {
    id: "Phase V",
    name: "Circular & Industrial Infrastructure",
    objective:
      "Consider biomethane, advanced processing and cold-chain systems only when the economics support them.",
    detail: [
      "Biogas and biomethane pursued only after technical and commercial feasibility work.",
      "Capital-intensive infrastructure follows demonstrated scale, never precedes it.",
    ],
    status: "future",
  },
];

export const capitalThreshold = {
  amount: "₦400 million",
  headline: "Retained before the flagship estate is developed",
  rationale:
    "The objective is to avoid becoming asset-rich but cash-poor. Land and infrastructure are the easiest way to consume every naira a farming business earns, and the fastest way to stall it.",
  rules: [
    "Treat ₦400 million as a hard strategic threshold under the current plan.",
    "Separate retained capital from the working capital needed for ongoing production.",
    "Investigate long-term lease or lease-to-own structures before outright purchase.",
    "Do not allow land acquisition to consume most available capital.",
    "Keep initial infrastructure functional, durable and cost-efficient.",
    "Maintain a meaningful contingency reserve.",
  ],
} as const;

export const financialDiscipline = [
  "No expansion solely because revenue increased — expansion follows verified margins and cash flow.",
  "Maintain a contingency reserve before committing the next cycle's capital.",
  "Separate retained capital from working capital.",
  "Track each crop and livestock unit independently.",
  "Avoid deploying the entire proceeds of a successful cycle into the next cycle.",
  "Use debt selectively, only where repayment is supported by predictable cash flow.",
] as const;

export const fiveYearVision = {
  horizon: "August 2031",
  narrative:
    "By August 2031 the objective is for Green-X to have moved from a promising farm concept into a functioning agricultural enterprise with an established operating history.",
  markers: [
    "A permanent agricultural base",
    "Recurring tomato and ginger operations",
    "Established aggregation networks",
    "Export capability",
    "Initial processing assets",
    "Growing logistics capacity",
    "Early poultry and aquaculture where justified",
  ],
  ambition:
    "The longer-term commercial ambition is approximately ₦1 billion in annual revenue once sufficient scale is achieved. This is a strategic ambition, not a present financial forecast, and must ultimately be validated by detailed crop-level economics.",
} as const;

export const researchGaps = [
  "Current land pricing and legal/lease structures in candidate Lapai zones.",
  "Site-specific groundwater and surface-water availability around candidate Lapai locations.",
  "Detailed dry-season tomato economics around Masaka/Koya, compared with other production zones such as Jos.",
  "Southern Kaduna ginger costs, yields, disease risks, land rental and post-harvest economics.",
  "Exact large-basket capacity used in the local tomato market.",
  "Export requirements and buyer specifications for dried ginger and other proposed products.",
  "Cocoa supply corridors and the optimal southern aggregation and processing location.",
  "Shea quality, supply and processing economics in Niger State and neighbouring areas.",
  "Rice economics before committing substantial land or processing capital.",
  "Site-specific agronomic suitability of orchard crops.",
] as const;
