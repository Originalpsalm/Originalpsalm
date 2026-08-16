/**
 * Company story, founders, governance and risk framework.
 */

export const story = [
  {
    heading: "We did not arrive at this without experience",
    body: "Green-X Farm was founded by two young Nigerian entrepreneurs. Before this proposal existed, the founders had already cultivated tomatoes, generated income from agricultural activity and explored other small businesses while building capital.",
  },
  {
    heading: "An unexpected setback",
    body: "An accident resulted in medical expenses of approximately ₦1.6 million. Meeting those costs required borrowing and liquidating capital and assets built through previous business activity, including funds and stock invested in a small phone-trading business.",
  },
  {
    heading: "Recovery, and a decision",
    body: "Treatment has been completed and recovery is ongoing. The founder can move around again, though physical capacity is not yet what it was before the accident. Rather than allowing the setback to end the entrepreneurial journey, the founders chose to rebuild around a business where they already have practical experience, access to land, agricultural relationships and a defined production plan.",
  },
  {
    heading: "What we are actually asking for",
    body: "The purpose is not to ask someone to create a business for us. It is to secure the working capital required to restart and properly execute a productive agricultural cycle, rebuild capital through enterprise, and expand progressively from there.",
  },
] as const;

export const founders = [
  {
    initials: "A",
    role: "Co-founder & CEO",
    focus: "Strategy & Commercial Development",
    responsibilities: [
      "Strategy and long-term planning",
      "Finance oversight and procurement",
      "Marketing and buyer relationships",
      "Expansion and investor relations",
    ],
  },
  {
    initials: "B",
    role: "Co-founder & CEO",
    focus: "Operations & Agricultural Development",
    responsibilities: [
      "Field operations and agricultural execution",
      "Grower coordination and supervision",
      "Logistics coordination",
      "Production records and site oversight",
    ],
  },
] as const;

export const governance = [
  {
    area: "Ownership",
    detail: "A 50/50 structure between the two founders.",
  },
  {
    area: "Compensation",
    detail:
      "Neither founder takes a salary during the early capital-building stage, unless the business later establishes the capacity and governance basis for it.",
  },
  {
    area: "Decision model",
    detail: "Joint strategic decisions across both founders.",
  },
  {
    area: "Deadlock",
    detail:
      "Material disagreements are handled through independent experts and an advisory or board mechanism, rather than allowing 50/50 ownership to become paralysed.",
  },
  {
    area: "Operating model",
    detail:
      "Founders remain hands-on with direct site supervision. Experienced local growers handle specialised field execution, and external professionals are engaged for agronomy, finance, legal, engineering and export compliance.",
  },
  {
    area: "Advisory structure",
    detail: "An advisory structure develops as the company grows.",
  },
] as const;

export const riskFramework = [
  { risk: "Production", control: "Experienced growers, irrigation reliability, agronomic monitoring and contingency inputs." },
  { risk: "Price", control: "Conservative planning prices, multiple buyers, and no assumption of peak prices." },
  { risk: "Water", control: "Site-specific surface and groundwater verification before permanent development." },
  { risk: "Land", control: "Documented leases, structured tenure and due diligence." },
  { risk: "Logistics", control: "Multiple transport options with progressive internalisation." },
  { risk: "Export", control: "Buyer specifications and compliance confirmed before major processing investment." },
  { risk: "Capital", control: "The ₦400m threshold and deliberate liquidity preservation." },
  { risk: "Management", control: "Clear roles, records, independent advice and an advisory/board mechanism." },
] as const;

export const impact = [
  "Direct seasonal employment in the Masaka/Koya area.",
  "Income for local agricultural service providers and transporters.",
  "Practical youth participation in commercial agriculture.",
  "Additional food supply for the Abuja/Nasarawa corridor.",
  "Development of agricultural, management and entrepreneurial skills.",
] as const;
