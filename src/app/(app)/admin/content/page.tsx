import Link from "next/link";
import { Crown, Plus, Upload } from "lucide-react";
import { contentBreakdown } from "@/lib/admin";
import { freeYears } from "@/lib/content-rules";
import { Alert, Badge, ButtonLink } from "@/components/ui";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function AdminContentPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const rows = contentBreakdown();
  const nFree = freeYears();
  const totalQuestions = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="space-y-4">
      {error === "confirm" && (
        <Alert>Deletion cancelled — the confirmation text did not match.</Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="leaf">{totalQuestions} questions</Badge>
        <Badge tone="mist">{rows.length} papers</Badge>
        <p className="min-w-0 flex-1 text-xs text-mist">
          The <b className="text-chalk">{nFree} most recent years</b> of each subject are free;
          older years are Premium.
        </p>
        <ButtonLink href="/admin/content/import" variant="gold" size="sm">
          <Upload size={14} /> Bulk import
        </ButtonLink>
        <ButtonLink href="/admin/content/new" size="sm">
          <Plus size={14} /> New paper
        </ButtonLink>
      </div>

      {rows.length === 0 ? (
        <div className="card px-5 py-12 text-center">
          <p className="text-sm text-mist">No papers loaded yet.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/admin/content/import" variant="gold" size="sm">
              <Upload size={14} /> Bulk import a CSV
            </ButtonLink>
            <ButtonLink href="/admin/content/new" variant="ghost" size="sm">
              Add one paper
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-leaf-500/12 text-left text-xs uppercase tracking-wide text-mist">
                <th className="px-4 py-3 font-medium">Exam</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Access</th>
                <th className="px-4 py-3 text-right font-medium">Questions</th>
                <th className="px-4 py-3 text-right font-medium">Attempts</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isFree = row.year_rank <= nFree;
                return (
                  <tr
                    key={`${row.exam_body}-${row.subject}-${row.year}`}
                    className="border-b border-leaf-500/8 last:border-0"
                  >
                    <td className="px-4 py-2.5 font-semibold text-leaf-400">{row.exam_body}</td>
                    <td className="px-4 py-2.5">{row.subject}</td>
                    <td className="px-4 py-2.5 tabular-nums text-mist">{row.year}</td>
                    <td className="px-4 py-2.5">
                      {isFree ? (
                        <Badge tone="leaf">Free</Badge>
                      ) : (
                        <Badge tone="gold">
                          <Crown size={10} /> Premium
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{row.total}</td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="surface p-4 text-xs leading-relaxed text-mist">
        Free vs Premium is decided by year automatically — as you add newer years, last year's free
        papers roll into Premium and the newest stay free. Change how many years are free on the{" "}
        <Link href="/admin/settings" className="focus-ring rounded text-leaf-400 hover:underline">
          Settings
        </Link>{" "}
        tab.
      </p>
    </div>
  );
}
