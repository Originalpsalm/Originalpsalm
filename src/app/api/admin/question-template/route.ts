import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";

/**
 * A ready-to-fill CSV template with the exact headers the importer expects and
 * two worked example rows, so an admin (or an AI asked to fill it) has a
 * pattern to copy. Admin-only to keep the internal format out of public view.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) {
    return new NextResponse("Not authorised", { status: 404 });
  }

  const rows = [
    [
      "exam_body",
      "subject",
      "year",
      "question",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "answer",
      "explanation",
      "topic",
    ],
    [
      "WAEC",
      "Mathematics",
      "2024",
      "Simplify 2/3 + 1/6.",
      "5/6",
      "1/2",
      "3/9",
      "1",
      "A",
      "Use a common denominator of 6: 4/6 + 1/6 = 5/6.",
      "Fractions",
    ],
    [
      "JAMB",
      "English Language",
      "2024",
      "Choose the word nearest in meaning to DILIGENT.",
      "lazy",
      "hardworking",
      "careless",
      "slow",
      "B",
      "Diligent means showing steady, careful effort — hardworking.",
      "Lexis",
    ],
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="guru-questions-template.csv"',
    },
  });
}
