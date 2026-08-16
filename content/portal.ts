/**
 * Investor room — a preview of the reporting environment participants receive.
 *
 * This is a demonstration of the reporting format, not a live account system.
 * The gate is a front-end preview only and protects nothing; do not put real
 * investor data in this file. When a genuine portal is built it needs real
 * authentication and a server-side data source.
 */

export const portalAccess = {
  /** Demo access code shown on the gate itself — this is intentionally public. */
  code: "GREENX",
  notice:
    "This is a preview of the reporting format Green-X participants receive. It contains illustrative figures, not a live account.",
} as const;

export const portalSummary = [
  { label: "Active positions", value: "1", detail: "Koya Cycle I" },
  { label: "Committed capital", value: "₦1,200,000", detail: "Across all rounds" },
  { label: "Cycle stage", value: "Establishment", detail: "Week 4 of the crop calendar" },
  { label: "Budget drawn", value: "38%", detail: "Against the published line-item budget" },
] as const;

export const portalPositions = [
  {
    code: "GX-T01",
    name: "Koya Dry-Season Tomato — Cycle I",
    instrument: "Partial funding",
    committed: "₦1,200,000",
    stage: "Establishment",
    nextReport: "Weekly — cost and crop record",
  },
] as const;

export const portalKpis = [
  { label: "Cultivated area", planned: "1.0 ha", actual: "1.0 ha", state: "on-track" as const },
  { label: "Irrigation installed", planned: "Pre-planting", actual: "Installed & tested", state: "on-track" as const },
  { label: "Expenditure vs budget", planned: "₦1,140,000", actual: "₦1,126,400", state: "on-track" as const },
  { label: "Total harvest", planned: "20 t (planning)", actual: "Pending harvest", state: "pending" as const },
  { label: "Marketable yield", planned: "Recorded separately", actual: "Pending harvest", state: "pending" as const },
  { label: "Realised price", planned: "₦50,000 / basket (planning)", actual: "Pending sales", state: "pending" as const },
] as const;

export const portalUpdates = [
  {
    week: "Week 4",
    title: "Crop established; fertilisation schedule commenced",
    body: "Full field establishment completed. The scheduled fertilisation and crop-protection programme has commenced under grower supervision. Expenditure tracking ₦13,600 under budget to date.",
  },
  {
    week: "Week 2",
    title: "Land preparation and nursery complete",
    body: "Land preparation finished and the nursery established. Seeds and opening input procurement completed against supplier quotations, with invoices filed to the project record.",
  },
  {
    week: "Week 1",
    title: "Irrigation installed and pressure-tested",
    body: "Pump, engine, pipes and hoses procured, installed and pressure-tested ahead of planting. Fuel and repair reserve set aside as per the risk control schedule.",
  },
] as const;

export const portalDocuments = [
  { name: "Cycle I line-item budget", type: "Budget", updated: "Current" },
  { name: "Land arrangement evidence — Koya", type: "Land", updated: "Current" },
  { name: "Supplier quotations — irrigation & inputs", type: "Procurement", updated: "Current" },
  { name: "Weekly cost and crop records", type: "Reporting", updated: "Weekly" },
  { name: "Founder profiles", type: "Governance", updated: "Current" },
  { name: "Post-cycle production & financial report", type: "Reporting", updated: "At cycle close" },
] as const;
