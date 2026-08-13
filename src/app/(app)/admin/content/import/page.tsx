import Link from "next/link";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ImportPanel } from "./ImportPanel";
import { AiPrompt } from "./AiPrompt";

export const metadata = { title: "Bulk import questions" };

export default async function ImportPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/admin/content"
        className="focus-ring inline-flex items-center gap-1.5 rounded text-sm text-mist hover:text-chalk"
      >
        <ArrowLeft size={15} /> Content
      </Link>

      <header>
        <h2 className="text-xl font-extrabold tracking-tight">Bulk import questions</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          Upload a CSV and every row becomes a question, sorted into the right exam, subject and
          year automatically. This is the fast way to add hundreds at once.
        </p>
      </header>

      {/* --- step 1: get the template --- */}
      <section className="card p-5">
        <h3 className="flex items-center gap-2 font-bold">
          <span className="grid size-6 place-items-center rounded-full bg-leaf-500/15 text-xs font-bold text-leaf-400">
            1
          </span>
          Get the template
        </h3>
        <p className="mt-2 text-sm text-mist">
          It has the exact column headings and two example rows. Fill it in a spreadsheet (Excel,
          Google Sheets) or hand it to an AI with the prompt below.
        </p>
        <a
          href="/api/admin/question-template"
          className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full border border-leaf-500/25 px-4 py-2 text-sm font-semibold hover:border-leaf-500/50"
        >
          <Download size={15} /> Download CSV template
        </a>
      </section>

      {/* --- step 2: AI prompt --- */}
      <section className="card p-5">
        <h3 className="flex items-center gap-2 font-bold">
          <span className="grid size-6 place-items-center rounded-full bg-leaf-500/15 text-xs font-bold text-leaf-400">
            2
          </span>
          <Sparkles size={15} className="text-gold-400" /> Let AI fill it for you
        </h3>
        <p className="mt-2 text-sm text-mist">
          Paste this into ChatGPT, Claude or Gemini. Change the exam, subject and year, then save
          what it gives you as a <code className="rounded bg-ink-900 px-1 py-0.5 text-xs">.csv</code>{" "}
          file.
        </p>
        <AiPrompt />
        <p className="mt-3 text-xs text-mist/70">
          Always skim AI-generated answers before importing — you are the exam authority, and a
          wrong answer key is worse than a missing question.
        </p>
      </section>

      {/* --- step 3: upload --- */}
      <section className="card p-5">
        <h3 className="flex items-center gap-2 font-bold">
          <span className="grid size-6 place-items-center rounded-full bg-leaf-500/15 text-xs font-bold text-leaf-400">
            3
          </span>
          Upload and review
        </h3>
        <p className="mt-2 text-sm text-mist">
          You will see a summary of exactly what will be added, and any rows with problems, before
          anything is saved.
        </p>
        <div className="mt-4">
          <ImportPanel />
        </div>
      </section>
    </div>
  );
}
