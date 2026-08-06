import { contentBreakdown } from "@/lib/admin";
import { Badge } from "@/components/ui";

export default function AdminContentPage() {
  const rows = contentBreakdown();
  const totalQuestions = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="leaf">{totalQuestions} questions</Badge>
        <Badge tone="mist">{rows.length} papers</Badge>
        <p className="text-xs text-mist">
          Sorted by how often each paper is attempted — the busiest ones are where more years are
          worth adding first.
        </p>
      </div>

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="surface p-4 text-xs leading-relaxed text-mist">
        Questions are edited as plain data in{" "}
        <code className="rounded bg-ink-900 px-1.5 py-0.5">src/data/papers/</code> — one file per
        exam body. Add a paper there and run{" "}
        <code className="rounded bg-ink-900 px-1.5 py-0.5">npm run seed</code>; re-seeding replaces
        a paper rather than duplicating it. Everything after the fifth question of each paper is
        premium.
      </p>
    </div>
  );
}
