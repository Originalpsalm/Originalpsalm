/**
 * The project pipeline — activities Green-X intends to launch, in the order
 * the master plan sequences them. These are strategic intentions, not funded
 * rounds; anything ready for capital appears in `content/opportunities.ts`.
 */

export type ProjectStage = "active" | "next" | "phase-ii" | "phase-iii" | "long-term";

export type Project = {
  slug: string;
  name: string;
  category: string;
  stage: ProjectStage;
  location: string;
  summary: string;
  points: string[];
  precondition: string;
};

export const stageLabels: Record<ProjectStage, string> = {
  active: "In execution",
  next: "Next up",
  "phase-ii": "Phase II",
  "phase-iii": "Phase III",
  "long-term": "Long term",
};

export const projects: Project[] = [
  {
    slug: "dry-season-tomato",
    name: "Dry-Season Tomato Production",
    category: "Production · cash engine",
    stage: "active",
    location: "Koya / Masaka axis, Nasarawa State",
    summary:
      "The immediate capital engine. Controlled dry-season tomato production on existing leased land, sold into the Abuja and Nasarawa market corridor.",
    points: [
      "Start on the existing ≈1-hectare Koya plot with a fully funded cycle.",
      "20 tonnes per hectare used as the conservative planning yield.",
      "Sell through wholesalers, market women, retailers, restaurants, supermarkets and direct farm-gate buyers.",
      "Ugu and okra used as supporting crops, not independent businesses.",
      "Expand after successful cycles — not merely because more land is available.",
    ],
    precondition: "Funded and running now.",
  },
  {
    slug: "southern-kaduna-ginger",
    name: "Southern Kaduna Ginger",
    category: "Production · export development",
    stage: "next",
    location: "Southern Kaduna",
    summary:
      "A controlled one-hectare first cycle run as both a production test and a market-intelligence exercise, building the farmer relationships that later make aggregation possible.",
    points: [
      "Rent land during the learning stage rather than purchase.",
      "Sell part of the harvest fresh and dry part of it, then compare the two markets on real numbers.",
      "Scale only when production economics and market conditions justify additional capital.",
      "Build farmer relationships for future aggregation.",
    ],
    precondition: "Prepared in parallel with the tomato cycle; capital follows Cycle I close-out.",
  },
  {
    slug: "ginger-export-hub",
    name: "Ginger Handling, Drying & Export Hub",
    category: "Processing · export",
    stage: "phase-ii",
    location: "Southern Kaduna",
    summary:
      "A small receiving, cleaning, sorting and drying facility with quality control, packaging and traceability, plus the Nigerian export registrations required before commercial shipment.",
    points: [
      "Buyer-first discipline: credible international buyers and written specifications before major infrastructure spending.",
      "Receiving and storage facility sized to actual aggregated volume.",
      "Cleaning, sorting and drying capability matched to buyer moisture and contamination requirements.",
      "Aggregate from other farmers when own production is insufficient, under Green-X quality controls.",
    ],
    precondition: "Volume, quality, buyer demand and regulatory requirements must all justify it.",
  },
  {
    slug: "lapai-flagship-estate",
    name: "Green-X Flagship Estate — Lapai",
    category: "Land · infrastructure",
    stage: "phase-ii",
    location: "Lapai, Niger State",
    summary:
      "The principal Green-X estate. A target of approximately 100 hectares, with an ambition of up to 200 hectares if acquisition economics are favourable — developed deliberately slowly.",
    points: [
      "Development initially limited to about 10 hectares rather than cultivating the whole estate immediately.",
      "Essential administration and staff facilities, warehousing and basic post-harvest handling.",
      "Long-term lease or lease-to-own structures investigated before outright purchase.",
      "Reserved space for future orchard and processing expansion.",
      "Potential rice production where site hydrology and economics support it.",
    ],
    precondition:
      "Approximately ₦400 million in retained capital, plus site-specific due diligence on land pricing, title, groundwater, roads and security.",
  },
  {
    slug: "shea-value-chain",
    name: "Shea Aggregation & Refining",
    category: "Aggregation · processing",
    stage: "phase-iii",
    location: "Niger State and surrounding producing communities",
    summary:
      "Niger-centred shea nut aggregation moving progressively into refined shea butter, rather than exporting raw nuts indefinitely.",
    points: [
      "Aggregate shea nuts from farmers and collectors with verified quality and volume.",
      "Establish quality control and traceability from collector to shipment.",
      "Move progressively into refined butter rather than raw-nut export only.",
      "Develop bulk B2B markets before consumer-heavy product lines.",
    ],
    precondition: "Verified shea quality, supply and processing economics in Niger State and neighbouring areas.",
  },
  {
    slug: "cocoa-value-chain",
    name: "Cocoa Aggregation & Value Chain",
    category: "Aggregation · export",
    stage: "phase-iii",
    location: "Southern processing corridor — site to be researched",
    summary:
      "Aggregate cocoa from established producing regions first; understand supply, quality, pricing, buyer requirements and export economics before considering plantation or processing scale.",
    points: [
      "Aggregation before plantation — no large cocoa estate as a first move.",
      "A separate southern aggregation base is likely preferable to moving large volumes to Niger State.",
      "Location selected after a supply-chain and export-corridor study.",
      "Higher-value processing — powder, butter, chocolate — is a later stage triggered by demonstrated supply and demand.",
    ],
    precondition: "A completed cocoa supply-corridor and export study.",
  },
  {
    slug: "orchard-programme",
    name: "Orchard Programme",
    category: "Perennial crops",
    stage: "phase-iii",
    location: "Flagship estate, Niger State",
    summary:
      "Avocado, cashew, mango and orange as long-term orchard candidates, with banana and plantain interplanted where agronomically appropriate to generate cash flow while perennials mature.",
    points: [
      "Avocado is strategically attractive as a pathway toward avocado oil.",
      "Cashew carries export and processing potential.",
      "Banana and plantain provide earlier cash flow during the maturation period.",
      "Final selection follows site-specific agronomic and market feasibility.",
    ],
    precondition: "Estate secured and site-specific agronomic suitability confirmed.",
  },
  {
    slug: "poultry-and-aquaculture",
    name: "Poultry & Aquaculture",
    category: "Livestock",
    stage: "phase-iii",
    location: "Flagship estate, Niger State",
    summary:
      "Layers, broilers and catfish as the early livestock candidates, deliberately delayed until the core crop and aggregation businesses are operationally stable.",
    points: [
      "Layers for egg production and recurring cash flow; broilers for meat supply; catfish for the local protein market.",
      "Cattle, goats and sheep are later-stage; rabbits only if demand is proven.",
      "Each unit tracked as a distinct economic unit so strong units scale and weak ones are redesigned or stopped.",
      "Hydroponic or sprouted fodder evaluated as feed support, not as an automatic replacement for conventional feed.",
    ],
    precondition: "Demonstrated operational stability in the core crop and aggregation businesses.",
  },
  {
    slug: "logistics-and-distribution",
    name: "Logistics & Fresh-Produce Distribution",
    category: "Distribution",
    stage: "phase-iii",
    location: "Abuja coordination point",
    summary:
      "A staged move from third-party transport to a dedicated Green-X fleet, alongside a flagship Abuja fresh-produce outlet and wholesale partnerships.",
    points: [
      "Stage 1 — third-party transport and hired vehicles while volumes are small.",
      "Stage 2 — lease-to-own or owned delivery vehicles once route volumes are predictable.",
      "Stage 3 — dedicated fleet for farm-to-hub, hub-to-market and export movements.",
      "Track fuel, loading, turnaround time, spoilage, losses and vehicle utilisation from day one.",
    ],
    precondition: "Predictable route volumes that justify internalising transport.",
  },
  {
    slug: "processing-and-cold-chain",
    name: "Processing, Cold Chain & Circular Infrastructure",
    category: "Agro-industrial",
    stage: "long-term",
    location: "To be determined by economics",
    summary:
      "Capital-intensive systems — advanced processing, cold chain, compliant slaughter facilities and biogas or biomethane — considered only when the economics genuinely support them.",
    points: [
      "Biogas and biomethane are deliberately removed from the startup core.",
      "They remain a long-term circular-economy option once livestock manure, organic waste and processing energy demand exist at sufficient scale.",
      "Fresh meat supply may eventually be supported by compliant slaughter and cold-chain infrastructure.",
      "Pursued only after technical and commercial feasibility work.",
    ],
    precondition: "Scale, waste volume and energy demand that make the economics work.",
  },
];

export type Crop = {
  crop: string;
  role: string;
  priority: "Core" | "Core strategic" | "Strategic" | "Secondary" | "Support" | "Conditional";
  stage: string;
};

export const cropArchitecture: Crop[] = [
  { crop: "Tomato", role: "Cash generation and market learning", priority: "Core", stage: "Pre-estate → Phase I" },
  { crop: "Ginger", role: "Export, aggregation and future processing", priority: "Core", stage: "Pre-estate → Phase I/II" },
  { crop: "Cocoa", role: "Aggregation and export first; processing later", priority: "Core strategic", stage: "Phase II/III" },
  { crop: "Shea", role: "Aggregation and refined-butter processing", priority: "Core strategic", stage: "Phase II/III" },
  { crop: "Cashew", role: "Orchard, aggregation and export", priority: "Strategic", stage: "Later" },
  { crop: "Avocado", role: "Long-term orchard and possible oil processing", priority: "Conditional", stage: "Later" },
  { crop: "Rice", role: "Local food market and possible branded rice", priority: "Conditional", stage: "Phase I/II after feasibility" },
  { crop: "Hibiscus (zobo)", role: "Secondary export diversification", priority: "Secondary", stage: "Phase I/II" },
  { crop: "Mango", role: "Orchard diversification", priority: "Secondary", stage: "Later" },
  { crop: "Orange", role: "Orchard diversification", priority: "Secondary", stage: "Later" },
  { crop: "Banana & plantain", role: "Early orchard cash flow and support crop", priority: "Support", stage: "With orchard development" },
];
