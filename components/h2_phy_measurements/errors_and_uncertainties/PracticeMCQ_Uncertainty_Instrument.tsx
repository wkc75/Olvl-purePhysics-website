"use client";

import React, { useMemo, useState } from "react";

/**
 * PracticeMCQ_Uncertainty_Instrument
 *
 * A single, interactive MCQ practice component for measurement uncertainty.
 *
 * Topic: Measurement & Uncertainty
 * Focus: Uncertainty due to instrument resolution (metre rule)
 *
 * This component includes:
 * ✅ Expand / Collapse toggle (collapsed by default)
 * ✅ MCQ selection + submit
 * ✅ Correct / Wrong feedback
 * ✅ "Try Again" + "Show Answer" flow
 * ✅ Highlights correct option ONLY when "Show Answer" is clicked
 *
 * IMPORTANT DESIGN RULE:
 * - Toggle state should NOT reset quiz progress.
 */
export default function PracticeMCQ_Uncertainty_Instrument() {
  // =========================================================
  // 0️⃣ TOGGLE UI STATE (controls expand/collapse only)
  // =========================================================
  /**
   * isOpen
   * - false: collapsed (only header visible)
   * - true : expanded (full question visible)
   *
   * This is purely UI state (layout).
   * It should NOT affect quiz state.
   */
  const [isOpen, setIsOpen] = useState(false);

  // =========================================================
  // 1️⃣ QUIZ STATE VARIABLES (controls learning logic)
  // =========================================================
  /**
   * selectedOption
   * Stores what the student selected.
   */
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  /**
   * hasSubmitted
   * Controls whether feedback is shown.
   */
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /**
   * showAnswer
   * Reveals correct option + full explanation when requested.
   */
  const [showAnswer, setShowAnswer] = useState(false);

  // =========================================================
  // 2️⃣ QUESTION DATA (physics content)
  // =========================================================
  const question =
    "A metre rule has a smallest scale division of 0.001 m. What is the uncertainty incurred in a length measurement taken using this metre rule?";

  /**
   * Key teaching point:
   * - Measuring length with a metre rule requires TWO readings
   * - Each reading has an uncertainty of ± (½ × smallest scale division)
   * - Total uncertainty is the SUM of uncertainties from both readings
   */
  const options = [
    "± 0.001 m",  // ✅ correct (two readings)
    "± 0.0005 m", // ❌ only one reading considered
    "± 0.002 m",  // ❌ doubled incorrectly
    "0.001 m",    // ❌ missing ± sign
  ];

  const correctAnswer = "± 0.001 m";

  // =========================================================
  // 3️⃣ ANSWER CHECKING LOGIC
  // =========================================================
  /**
   * isCorrect
   * True only if selected option matches the correct answer.
   */
  const isCorrect = useMemo(() => {
    return selectedOption === correctAnswer;
  }, [selectedOption, correctAnswer]);

  /**
   * Highlight correct option ONLY when "Show Answer" is clicked.
   */
  const isOptionCorrectAndShouldHighlight = (option: string) =>
    showAnswer && option === correctAnswer;

  // =========================================================
  // 4️⃣ UI RENDERING
  // =========================================================
  return (
    <section className="max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* =====================================================
            TOGGLE HEADER (always visible)
            ===================================================== */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Practice Question: Measurement Uncertainty
          </h2>

          <span
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {/* =====================================================
            COLLAPSIBLE CONTENT (animated)
            ===================================================== */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-6">
            {/* Question text */}
            <p className="mt-1 text-slate-800">{question}</p>

            {/* =====================================================
                OPTIONS SECTION
                ===================================================== */}
            <fieldset className="mt-4 space-y-2">
              <legend className="sr-only">Multiple choice options</legend>

              {options.map((option) => (
                <label
                  key={option}
                  className={[
                    "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                    selectedOption === option
                      ? "border-slate-400 bg-slate-50"
                      : "border-slate-200 bg-white hover:bg-slate-50",
                    isOptionCorrectAndShouldHighlight(option)
                      ? "border-green-500 bg-green-50"
                      : "",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="uncertainty-instrument"
                    checked={selectedOption === option}
                    onChange={() => setSelectedOption(option)}
                    className="h-4 w-4"
                  />

                  <span className="text-slate-900">{option}</span>
                </label>
              ))}
            </fieldset>

            {/* =====================================================
                SUBMIT BUTTON
                ===================================================== */}
            <button
              type="button"
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={selectedOption === null}
              onClick={() => {
                setHasSubmitted(true);
                setShowAnswer(false);
              }}
            >
              Submit Answer
            </button>

            {/* =====================================================
                FEEDBACK SECTION
                ===================================================== */}
            {hasSubmitted && (
              <div className="mt-5 rounded-xl border bg-slate-50 p-4">
                {isCorrect ? (
                  <>
                    <p className="font-semibold text-green-700">✅ Correct!</p>

                    <p className="mt-2 text-slate-800">
                      <span className="font-medium">Explanation:</span>
                      <br />
                      When using a metre rule to measure length,{" "}
                      <span className="font-medium">
                        two readings are taken
                      </span>
                      : one at the zero end and one at the other end of the object.
                      <br />
                      <br />
                      Each reading has an uncertainty of{" "}
                      <span className="font-medium">
                        ± (½ × smallest scale division)
                      </span>
                      .
                      <br />
                      Smallest scale division = 0.001 m
                      <br />
                      Uncertainty per reading = ± 0.0005 m
                      <br />
                      <br />
                      Since two readings are involved:
                      <br />
                      <span className="font-mono">
                        Total uncertainty = ± (0.0005 + 0.0005) = ± 0.001 m
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-red-700">
                      ❌ That’s not correct.
                    </p>

                    <p className="mt-2 text-slate-800">
                      Hint:
                      <br />
                      • How many readings are taken when measuring length with a
                      metre rule?
                      <br />
                      • Is uncertainty incurred once, or for each reading?
                      <br />
                      • How should uncertainties be combined?
                    </p>

                    <div className="mt-4 flex gap-3">
                      <button
                        className="rounded-xl border px-4 py-2"
                        onClick={() => {
                          setSelectedOption(null);
                          setHasSubmitted(false);
                          setShowAnswer(false);
                        }}
                      >
                        Try Again
                      </button>

                      <button
                        className="rounded-xl bg-blue-600 px-4 py-2 text-white"
                        onClick={() => setShowAnswer(true)}
                      >
                        Show Answer
                      </button>
                    </div>

                    {showAnswer && (
                      <div className="mt-4 rounded-xl bg-blue-50 p-4">
                        <p className="font-semibold text-blue-900">
                          ✅ Answer: ± 0.001 m
                        </p>

                        <p className="mt-2 text-blue-900">
                          Measuring length with a metre rule involves{" "}
                          <span className="font-medium">two readings</span>.
                          <br />
                          <br />
                          Uncertainty per reading:
                          <br />
                          <span className="font-mono">
                            ± (½ × 0.001) = ± 0.0005 m
                          </span>
                          <br />
                          <br />
                          Total uncertainty:
                          <br />
                          <span className="font-mono">
                            ± (0.0005 + 0.0005) = ± 0.001 m
                          </span>
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
