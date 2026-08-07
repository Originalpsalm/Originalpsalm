import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { knownSubjects } from "@/lib/admin";
import { EXAM_BODIES } from "@/lib/types";
import { PaperForm } from "./PaperForm";

export const metadata = { title: "New paper" };

export default function NewPaperPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link
        href="/admin/content"
        className="focus-ring inline-flex items-center gap-1.5 rounded text-sm text-mist hover:text-chalk"
      >
        <ArrowLeft size={15} /> Content
      </Link>

      <h2 className="text-xl font-extrabold tracking-tight">New paper</h2>
      <p className="text-sm text-mist">
        Pick the exam body, subject and year. Once you save, you will land in the editor and can
        start adding questions.
      </p>

      <PaperForm bodies={EXAM_BODIES.map((b) => b.id)} knownSubjects={knownSubjects()} />
    </div>
  );
}
