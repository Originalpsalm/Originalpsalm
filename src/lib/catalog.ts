import type { ExamBody } from "./types";

/**
 * The official subject catalog for each exam body.
 *
 * This is what lets the app list every real Nigerian exam subject — even ones
 * with no questions loaded yet — so students see the full roadmap and you, the
 * admin, decide how much to upload for each subject, year by year. A subject
 * with zero questions shows as "Coming soon" and can't be started until you
 * import its first question.
 *
 * These names are also the exact `subject` values to use in your CSV uploads,
 * so keep spelling consistent with the list here and papers file into the right
 * place automatically.
 */

// The standard WASSCE / SSCE academic subjects, shared by WAEC and NECO.
const SSCE_ACADEMIC = [
  "English Language",
  "Mathematics",
  "Further Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Agricultural Science",
  "Economics",
  "Geography",
  "Government",
  "Commerce",
  "Financial Accounting",
  "Book Keeping",
  "Literature in English",
  "History",
  "Civic Education",
  "Christian Religious Studies",
  "Islamic Studies",
  "Data Processing",
  "Computer Studies",
  "Marketing",
  "Insurance",
  "Office Practice",
  "Store Management",
  "Physical Education",
  "Health Education",
  "Food and Nutrition",
  "Home Management",
  "Clothing and Textiles",
  "Visual Art",
  "Music",
  "French",
  "Arabic",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Technical Drawing",
];

// The trade / technical subjects that make NABTEB distinct.
const NABTEB_TRADES = [
  "Auto Mechanical Work",
  "Auto Electrical Work",
  "Block Laying, Bricklaying and Concreting",
  "Building Construction",
  "Woodwork",
  "Furniture Making",
  "Metal Work",
  "Welding and Fabrication Engineering Craft Practice",
  "Electrical Installation and Maintenance Work",
  "Basic Electricity",
  "Basic Electronics",
  "Radio, Television and Electronics Work",
  "Refrigeration and Air Conditioning",
  "Plumbing and Pipe Fitting",
  "Painting and Decorating",
  "Animal Husbandry",
  "Fisheries",
  "Catering Craft Practice",
  "Garment Making",
  "Cosmetology",
  "Photography",
  "GSM Phone Maintenance and Repairs",
];

// JAMB UTME subjects (English is compulsory; candidates add three others).
const JAMB_UTME = [
  "Use of English",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Agricultural Science",
  "Economics",
  "Geography",
  "Government",
  "Commerce",
  "Principles of Accounts",
  "Literature in English",
  "History",
  "Civic Education",
  "Christian Religious Studies",
  "Islamic Studies",
  "French",
  "Arabic",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Home Economics",
  "Physical Education",
  "Fine Arts",
  "Music",
];

function sortedUnique(names: string[]): string[] {
  return [...new Set(names)].sort((a, b) => a.localeCompare(b));
}

export const SUBJECTS_BY_BODY: Record<ExamBody, string[]> = {
  WAEC: sortedUnique(SSCE_ACADEMIC),
  NECO: sortedUnique(SSCE_ACADEMIC),
  NABTEB: sortedUnique([...SSCE_ACADEMIC, ...NABTEB_TRADES]),
  JAMB: sortedUnique(JAMB_UTME),
};

/** The official subjects for a body, or an empty list for an unknown one. */
export function catalogSubjects(body: ExamBody): string[] {
  return SUBJECTS_BY_BODY[body] ?? [];
}

/** Whether a subject name is part of a body's official catalog. */
export function isCatalogSubject(body: ExamBody, subject: string): boolean {
  return catalogSubjects(body).some((s) => s.toLowerCase() === subject.trim().toLowerCase());
}

/** Every distinct subject name across all bodies — handy for admin datalists. */
export function allCatalogSubjects(): string[] {
  return sortedUnique(Object.values(SUBJECTS_BY_BODY).flat());
}
