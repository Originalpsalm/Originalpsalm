import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Crown, Lightbulb, RotateCcw, Share2, X } from "lucide-react";
import { isPremium, requireUser } from "@/lib/auth";
import { attemptById, attemptReview } from "@/lib/queries";
import { Badge, ButtonLink, cn } from "@/components/ui";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Your result" };

export default async function ResultsPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();
  const attempt = attemptById(Number(id), user.id);
  if (!attempt) notFound();

  const review = attemptReview(attempt.id);
  const premium = isPremium(user);
  const percent = Math.round((attempt.score / attempt.total) * 100);

  const verdict =
    percent >= 80
      ? { title: "Excellent!", note: "You are ready for this paper.", tone: "leaf" as const }
      : percent >= 60
        ? { title: "Good work", note: "A few more rounds and you have it.", tone: "leaf" as const }
        : percent >= 40
          ? { title: "Getting there", note: "Study the working below carefully.", tone: "gold" as const }
          : { title: "Keep pushing", note: "Read every explanation, then try again.", tone: "red" as const };

  const minutes = Math.floor(attempt.seconds_spent / 60);
  const seconds = attempt.seconds_spent % 60;

  // Topics the student actually lost marks on — the useful part of a result.
  const weakTopics = [
    ...new Set(review.filter((row) => !row.correct && row.topic).map((row) => row.topic!)),
  ].slice(0, 6);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* -------------------------------------------------------- score --- */}
      <section className="card animate-rise p-6 text-center sm:p-9">
        <p className="text-sm text-mist">
          {attempt.subject} · {attempt.exam_body} {attempt.year}
        </p>

        <div
          className="mx-auto mt-6 grid size-40 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${
              percent >= 60 ? "#17c471" : percent >= 40 ? "#f5b301" : "#ef4444"
            } ${percent * 3.6}deg, rgba(255,255,255,.06) 0)`,
          }}
        >
          <div className="grid size-32 place-items-center rounded-full bg-ink-900">
            <div>
              <p className="text-4xl font-extrabold tabular-nums">{percent}%</p>
              <p className="text-xs text-mist">
                {attempt.score} of {attempt.total}
              </p>
            </div>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">{verdict.title}</h1>
        <p className="mt-1 text-sm text-mist">{verdict.note}</p>

        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
          <Badge tone="mist">
            {minutes}m {seconds}s spent
          </Badge>
          <Badge tone="mist">{attempt.total - attempt.score} to review</Badge>
          {weakTopics.length > 0 && <Badge tone="gold">Weak: {weakTopics[0]}</Badge>}
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink
            href={`/practice/${attempt.exam_body}/${encodeURIComponent(attempt.subject)}/${attempt.year}`}
          >
            <RotateCcw size={16} /> Try again
          </ButtonLink>
          <ButtonLink
            href={`/practice/${attempt.exam_body}/${encodeURIComponent(attempt.subject)}`}
            variant="ghost"
          >
            Another year
          </ButtonLink>
          <ButtonLink href="/groups" variant="ghost">
            <Share2 size={16} /> Discuss in a group
          </ButtonLink>
        </div>
      </section>

      {/* -------------------------------------------------- weak topics --- */}
      {weakTopics.length > 0 && (
        <section className="surface p-5">
          <h2 className="text-sm font-bold">Topics to revise</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {weakTopics.map((topic) => (
              <Badge key={topic} tone="gold">
                {topic}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------- review --- */}
      <section>
        <h2 className="mb-3 text-lg font-bold">Question by question</h2>

        <ol className="space-y-3">
          {review.map((row, position) => {
            const options = [
              { letter: "A", text: row.option_a },
              { letter: "B", text: row.option_b },
              { letter: "C", text: row.option_c },
              { letter: "D", text: row.option_d },
            ];
            const correct = row.correct === 1;

            return (
              <li key={row.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                      correct ? "bg-leaf-500/15 text-leaf-400" : "bg-red-500/15 text-red-300",
                    )}
                  >
                    {correct ? <Check size={14} /> : <X size={14} />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[0.95rem] leading-relaxed font-medium">
                      <span className="text-mist">{position + 1}.</span> {row.text}
                    </p>

                    <div className="mt-4 space-y-2">
                      {options.map((option) => {
                        const isAnswer = option.letter === row.answer;
                        const wasChosen = option.letter === row.chosen;
                        return (
                          <div
                            key={option.letter}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                              isAnswer
                                ? "border-leaf-500/45 bg-leaf-500/10"
                                : wasChosen
                                  ? "border-red-500/40 bg-red-500/10"
                                  : "border-transparent bg-ink-900/40 text-mist",
                            )}
                          >
                            <span className="w-4 shrink-0 font-bold">{option.letter}</span>
                            <span className="min-w-0 flex-1">{option.text}</span>
                            {isAnswer && (
                              <span className="shrink-0 text-xs font-semibold text-leaf-400">
                                correct
                              </span>
                            )}
                            {wasChosen && !isAnswer && (
                              <span className="shrink-0 text-xs font-semibold text-red-300">
                                you
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {row.chosen === null && (
                      <p className="mt-3 text-xs text-mist">You did not answer this one.</p>
                    )}

                    {/* Explanations are the product. Free users get them on the
                        questions they can attempt; premium gets everything. */}
                    {row.explanation && (
                      <div className="mt-4 flex gap-3 rounded-xl bg-gold-500/8 p-3.5">
                        <Lightbulb size={16} className="mt-0.5 shrink-0 text-gold-400" />
                        <p className="text-sm leading-relaxed text-mist">
                          <span className="font-semibold text-gold-400">How it is solved: </span>
                          {row.explanation}
                        </p>
                      </div>
                    )}

                    {row.topic && (
                      <p className="mt-3 text-xs text-mist/70">Topic · {row.topic}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {!premium && (
        <section className="card p-6 text-center">
          <Crown size={22} className="mx-auto text-gold-400" />
          <h2 className="mt-3 font-bold">That was the free half of the paper</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-mist">
            Premium opens every remaining question in this paper and in every other paper, each one
            with the working shown.
          </p>
          <ButtonLink href="/premium" variant="gold" className="mt-5">
            See Premium
          </ButtonLink>
        </section>
      )}

      <p className="text-center text-sm">
        <Link href="/dashboard" className="focus-ring rounded text-mist hover:text-chalk">
          Back to home
        </Link>
      </p>
    </div>
  );
}
