import Link from "next/link";
import { Plus } from "lucide-react";
import { contentBreakdown } from "@/lib/admin";
import { Alert, Badge, ButtonLink } from "@/components/ui";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminContentPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const rows = contentBreakdown();
  const totalQuestions = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="space-y-4">
      {error === "confirm" && (
        <Alert>Deletion cancelled — the confirmation text did not match.</Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="leaf">{totalQuestions} questions</Badge>
        <Badge tone="mist">{rows.length} papers</Badge>
        <p className="min-w-0 flex-1 text-xs text-mist">
          Sorted by how often each paper is attempted — busier papers benefit most from more years.
        </p>
        <ButtonLink href="/admin/content/new" size="sm">
          <Plus size={14} /> New paper
        </ButtonLink>
      </div>

      {rows.length === 0 ? (
        <p className="card px-5 py-12 text-center text-sm text-mist">
          No papers loaded yet. Click <b>New paper</b> to add the first one.
        </p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-leaf-500/12 text-left text-xs uppercase tracking-wide text-mist">
                <th className="px-4 py-3 font-medium">Exam</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 text-right font-medium">Questions</th>
                <th className="px-4 py-3 text-right font-medium">Free</th>
                <th className="px-4 py-3 text-right font-medium">Attempts</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.exam_body}-${row.subject}-${row.year}`}
                  className="border-b border-leaf-500/8 last:border-0"
                >
                  <td className="px-4 py-2.5 font-semibold text-leaf-400">{row.exam_body}</td>
                  <td className="px-4 py-2.5">{row.subject}</td>
                  <td className="px-4 py-2.5 tabular-nums text-mist">{row.year}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.total}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-mist">{row.free}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                    {row.attempts}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      href={`/admin/content/${row.exam_body}/${encodeURIComponent(row.subject)}/${row.year}`}
                      className="focus-ring rounded text-xs font-semibold text-leaf-400 hover:underline"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="surface p-4 text-xs leading-relaxed text-mist">
        Everything after the fifth question of a paper is premium by default. You can flip that on
        any question with the crown toggle. New questions are added to the end of the paper.
      </p>
    </div>
  );
}
