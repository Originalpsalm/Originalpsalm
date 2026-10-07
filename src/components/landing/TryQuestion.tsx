"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * One real past question a visitor can answer before signing up. Picking an
 * option marks it on the spot and shows the working — the same experience
 * they get inside GURU, in miniature.
 */

const QUESTION = {
  meta: "WAEC Mathematics 2023 · Question 10 of 10",
  text: "A bag contains 5 red and 3 blue balls. If one ball is picked at random, what is the probability that it is blue?",
  options: [
    { key: "A", text: "3/8" },
    { key: "B", text: "5/8" },
    { key: "C", text: "3/5" },
    { key: "D", text: "1/3" },
  ],
  answer: "A",
  working: "There are 8 balls in all and 3 are blue, so P(blue) = 3/8.",
};

export function TryQuestion() {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;
  const correct = picked === QUESTION.answer;

  return (
    <>
      <p className="lp-quiz-meta">{QUESTION.meta}</p>
      <p className="lp-quiz-q">{QUESTION.text}</p>

      <div className="lp-quiz-opts">
        {QUESTION.options.map((option) => {
          const isAnswer = option.key === QUESTION.answer;
          const isPicked = option.key === picked;
          let state = "";
          let tag = "";
          if (answered && isAnswer) {
            state = "lp-opt--right";
            tag = isPicked ? "Correct" : "Correct answer";
          } else if (answered && isPicked) {
            state = "lp-opt--wrong";
            tag = "Your answer";
          } else if (answered) {
            state = "lp-opt--dim";
          }
          return (
            <button
              key={option.key}
              type="button"
              className={`lp-opt ${state}`.trim()}
              aria-pressed={isPicked}
              disabled={answered}
              onClick={() => setPicked(option.key)}
            >
              <span className="lp-opt-key" aria-hidden="true">
                {option.key}
              </span>
              <span>{option.text}</span>
              {tag && <span className="lp-opt-tag">{tag}</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="lp-quiz-result" role="status">
          <p className={`lp-verdict ${correct ? "" : "lp-verdict--wrong"}`.trim()}>
            {correct ? "Correct. Here is the working." : "Not quite. The answer is A, 3/8."}
          </p>
          <p className="lp-quiz-how">
            <strong>How it is solved: </strong>
            {QUESTION.working}
          </p>
          <div className="lp-quiz-actions">
            <Link href="/signup" className="lp-btn lp-btn--ink lp-btn--md">
              Start free and do the full paper
            </Link>
            <button type="button" className="lp-link-btn" onClick={() => setPicked(null)}>
              Try again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
