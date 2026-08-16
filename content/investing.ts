/**
 * How to invest — instruments, process, reporting cadence and FAQ.
 */

export const instruments = [
  {
    name: "Full project funding",
    detail:
      "A single participant funds an entire bounded round. Simplest to administer, and the clearest line of sight from capital to crop.",
    fit: "Funders who want one defined project with one set of records.",
  },
  {
    name: "Partial funding",
    detail:
      "Participate alongside others in a round, with a defined tranche against the published line-item budget.",
    fit: "Investors who want exposure to a cycle without carrying it alone.",
  },
  {
    name: "Equipment & input sponsorship",
    detail:
      "Sponsor a specific asset or input line — irrigation equipment, fertiliser, crop protection — rather than cash into a general pot. Equipment carries forward across multiple cycles.",
    fit: "Sponsors and organisations who prefer in-kind support with visible, verifiable delivery.",
  },
  {
    name: "Strategic partnership",
    detail:
      "Capital combined with commercial involvement — offtake interest, market access, agronomic expertise or export relationships.",
    fit: "Partners who bring more than money and want a longer position in the value chain.",
  },
] as const;

export const process = [
  {
    step: "01",
    title: "Enquire",
    detail:
      "Tell us which round interests you and how you would prefer to participate. We respond with the current budget, the verification status of each assumption and any open quotations.",
  },
  {
    step: "02",
    title: "Review",
    detail:
      "You receive the line-item budget, the land arrangement evidence, supplier quotations for major equipment and inputs, and founder profiles. Questions are answered in writing.",
  },
  {
    step: "03",
    title: "Agree terms",
    detail:
      "We agree the instrument, the amount, the reporting cadence and what evidence you will receive. Terms are documented before any funds move.",
  },
  {
    step: "04",
    title: "Ring-fence",
    detail:
      "Project funds are ring-fenced to the specific round and recorded against the published budget. Capital diversion is treated as a named risk with a named control.",
  },
  {
    step: "05",
    title: "Execute & report",
    detail:
      "The cycle runs under direct founder supervision with weekly cost and crop records. You receive progress reporting through the cycle, not only at the end.",
  },
  {
    step: "06",
    title: "Close out",
    detail:
      "A post-cycle production and financial report records total harvest, marketable harvest, realised prices, verified expenditure, gross margin and the amount retained for the next cycle.",
  },
] as const;

export const reporting = [
  {
    cadence: "Weekly",
    item: "Cost and crop records",
    detail: "Expenditure against budget and crop health through the cycle.",
  },
  {
    cadence: "At key stages",
    item: "Milestone evidence",
    detail:
      "Irrigation installed and tested, land prepared, crop established, harvest commenced.",
  },
  {
    cadence: "Harvest window",
    item: "Sales progress",
    detail: "Marketable output moved and realised prices by channel.",
  },
  {
    cadence: "Cycle close",
    item: "Production & financial report",
    detail:
      "Full KPI set: yield, marketable yield, average price, revenue, production cost, gross margin and reinvestment.",
  },
] as const;

export const faqs = [
  {
    q: "What exactly is the ₦3,000,000 for?",
    a: "One full dry-season tomato cycle on approximately one hectare at Koya, broken into ten published line items covering irrigation, seeds, fertiliser, crop protection, land preparation, labour, fuel, welfare, harvest logistics and contingency. Final amounts are updated against current supplier quotations before expenditure.",
  },
  {
    q: "Is the 20 tonnes per hectare figure a projection or a promise?",
    a: "It is a conservative planning assumption and explicitly not a guarantee. Actual results depend on variety, agronomy, weather, irrigation, disease pressure and field management. We record total harvest and marketable harvest separately so rejected fruit is never counted as revenue.",
  },
  {
    q: "Why is the basket price not converted into a revenue forecast?",
    a: "Because local basket capacity varies and we have not yet physically verified the basket size used in the Masaka market. Publishing a revenue forecast built on an unverified conversion would be presenting a guess as a number. Revenue will be calculated from actual marketable output and realised selling prices.",
  },
  {
    q: "What happened with the previous cycle?",
    a: "The founders attempted tomato cultivation on the same plot with roughly ₦800,000 of their own capital. It was not enough to carry the crop, irrigation and fertilisation fell short at the critical stage, and the result was financially disappointing. That cycle is published in full on our track record page because it is the direct reason this round is sized and structured the way it is.",
  },
  {
    q: "How do I know funds are used as stated?",
    a: "Project funds are ring-fenced to the round and recorded against the published line-item budget. Green-X maintains records of expenditure and production progress and provides reasonable evidence of how supported funds are deployed, including supplier invoices for major equipment and inputs.",
  },
  {
    q: "What happens after a successful cycle?",
    a: "An agreed portion of proceeds is reinvested into the next cycle and the rest is retained. Expansion follows verified margins, never revenue alone, and never the entire proceeds of one cycle into the next. The long-term rule is a ₦400 million retained-capital threshold before the flagship estate is developed.",
  },
  {
    q: "Can I invest in the long-term estate or the processing projects now?",
    a: "No. Those sit in the project pipeline with explicit preconditions and are not yet costed for investment. We do not raise against activities whose economics we have not verified. When a pipeline project becomes financeable it moves into the opportunities section with a full budget.",
  },
  {
    q: "Who runs the operation day to day?",
    a: "Both founders remain hands-on, with one maintaining close oversight of the tomato cycle while the other prepares the next ginger cycle. Experienced tomato growers already known to the founders handle specialised field execution, and external professionals are engaged for agronomy, finance, legal and export compliance as required.",
  },
] as const;

export const investorAssurances = [
  {
    title: "Bounded rounds",
    body: "Every round funds one defined activity with a published budget. We do not raise general-purpose capital against a vision.",
  },
  {
    title: "Ring-fenced funds",
    body: "Project funds are held against the specific round and recorded line by line.",
  },
  {
    title: "Records from day one",
    body: "Weekly cost and crop records, not a reconstruction at the end of the cycle.",
  },
  {
    title: "Honest assumptions",
    body: "Planning figures are labelled as planning figures. Unverified conversions are not turned into forecasts.",
  },
  {
    title: "Published failures",
    body: "The undercapitalised cycle that went badly is on this site, with its cause and what changed because of it.",
  },
  {
    title: "Expansion follows evidence",
    body: "No round opens because the last one felt good. It opens when the numbers justify it.",
  },
] as const;
