"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type SignConvention = "RIGHT_POSITIVE" | "LEFT_POSITIVE";

function formatSigned(n: number) {
  return n > 0 ? `+${n}` : `${n}`; // keeps 0 as "0"
}

function directionTextFromAlgebraic(
  value: number,
  convention: SignConvention
): "left" | "right" | "none" {
  if (value === 0) return "none";

  // Algebraic sign is defined by the CURRENT sign convention.
  // If Right is +, then + means right.
  // If Left is +, then + means left.
  const positiveMeansRight = convention === "RIGHT_POSITIVE";
  const isPositive = value > 0;

  if (positiveMeansRight) return isPositive ? "right" : "left";
  return isPositive ? "left" : "right";
}

function conventionLabel(convention: SignConvention) {
  return convention === "RIGHT_POSITIVE"
    ? "Right = + , Left = −"
    : "Left = + , Right = −";
}

export default function Vector1DSimulation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Slider values are algebraic values in the CURRENT sign convention.
  // IMPORTANT: When we toggle sign convention, these numbers do NOT change.
  const [a, setA] = useState<number>(-4);
  const [b, setB] = useState<number>(+7);

  const [convention, setConvention] = useState<SignConvention>("RIGHT_POSITIVE");

  // Resultant is algebraic addition (O-Level rule in 1D once sign convention is chosen).
  const r = useMemo(() => a + b, [a, b]);

  // ===== Canvas rendering =====
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Responsive canvas: match CSS size + handle high DPI (retina) for sharpness
    const rect = wrap.getBoundingClientRect();
    const cssW = Math.max(320, Math.floor(rect.width));
    const cssH = 260;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cssW, cssH);
    ctx.clip();
    ctx.restore();
    ctx.clearRect(0, 0, cssW, cssH);

    // ===== Safe inner drawing area =====
    // This margin prevents arrows + labels from touching / overflowing the box
    const SAFE_MARGIN = 32;

    const drawableWidth = cssW - SAFE_MARGIN * 2;
    const cx = cssW / 2;
    const cy = Math.round(cssH * 0.6);

    // Axis half-length is now constrained by drawable width
    const axisHalf = drawableWidth / 2;


    // Scale: map 10 units to axisHalf
    const scale = axisHalf / 10;

    // Sign convention affects how algebraic + translates to screen right.
    // If Right is positive => + maps to screen right (factor +1)
    // If Left is positive  => + maps to screen left  (factor -1)
    const dirFactor = convention === "RIGHT_POSITIVE" ? 1 : -1;

    // ---------- Helpers ----------
    function drawLine(x1: number, y1: number, x2: number, y2: number, w = 2) {
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    function drawArrow(fromX: number, fromY: number, toX: number, toY: number) {
      const headLen = 10;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const ang = Math.atan2(dy, dx);

      // main shaft
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // arrow head
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLen * Math.cos(ang - Math.PI / 7),
        toY - headLen * Math.sin(ang - Math.PI / 7)
      );
      ctx.lineTo(
        toX - headLen * Math.cos(ang + Math.PI / 7),
        toY - headLen * Math.sin(ang + Math.PI / 7)
      );
      ctx.closePath();
      ctx.fill();
    }

    function drawVector(value: number, color: string, label: string, yOffset: number) {
      // Physics logic:
      // - value is algebraic in current sign convention.
      // - convert to screen dx using dirFactor.
      const dx = value * scale * dirFactor;

      const x0 = cx;
      const y0 = cy + yOffset;
      // Clamp arrow end so it never exceeds axis bounds
      const rawX1 = cx + dx;
      const x1 = Math.max(cx - axisHalf, Math.min(cx + axisHalf, rawX1));
      const y1 = y0;

      // Style
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      if (value === 0) {
        // Edge case: zero vector (no arrow), draw a dot + label.
        ctx.beginPath();
        ctx.arc(x0, y0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "14px ui-sans-serif, system-ui";
        ctx.fillText(`${label}: 0`, x0 + 10, y0 - 8);
        return;
      }

      drawArrow(x0, y0, x1, y1);

      // Label near the arrow
      ctx.font = "14px ui-sans-serif, system-ui";
      const txt = `${label}: ${formatSigned(value)}`;
      const tx = dx > 0 ? x1 + 8 : x1 - (ctx.measureText(txt).width + 8);
      ctx.fillText(txt, tx, y0 - 8);
    }

    // ---------- Draw axis ----------
    ctx.strokeStyle = "#0f172a"; // slate-900-ish
    ctx.lineWidth = 2;
    drawLine(cx - axisHalf, cy, cx + axisHalf, cy, 2);

    // End caps (small)
    drawLine(cx - axisHalf, cy - 6, cx - axisHalf, cy + 6, 2);
    drawLine(cx + axisHalf, cy - 6, cx + axisHalf, cy + 6, 2);

    // Origin marker
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "13px ui-sans-serif, system-ui";
    ctx.fillText("0", cx - 6, cy + 20);

    // Tick labels: -10, -5, +5, +10 (in algebraic numbers)
    // These are *positions on screen*, which do not change.
    // But the meaning of + direction DOES change (handled by convention label in UI).
    const ticks = [-10, -5, 5, 10];
    ctx.strokeStyle = "#334155"; // slate-700-ish
    ctx.fillStyle = "#334155";
    ctx.lineWidth = 1.5;

    ticks.forEach((t) => {
      const x = cx + t * scale;
      drawLine(x, cy - 6, x, cy + 6, 1.5);
      const label = t > 0 ? `+${t}` : `${t}`;
      ctx.fillText(label, x - 10, cy + 24);
    });

    // Direction labels on screen (physical left/right)
    ctx.fillStyle = "#0f172a";
    ctx.font = "13px ui-sans-serif, system-ui";
    ctx.fillText("Left", cx - axisHalf, cy - 14);
    ctx.fillText("Right", cx + axisHalf - 34, cy - 14);

    // ---------- Draw vectors ----------
    // Separate them vertically for clarity (still 1D since all arrows are horizontal).
    drawVector(a, "#2563eb", "A", -40); // blue
    drawVector(b, "#16a34a", "B", -10); // green
    drawVector(r, "#dc2626", "R = A + B", 22); // red

    // Small note about current + direction (pedagogical)
    ctx.fillStyle = "#0f172a";
    ctx.font = "12px ui-sans-serif, system-ui";
    const plusPhysical =
      convention === "RIGHT_POSITIVE" ? "right" : "left";
    ctx.fillText(
      `In this convention, "+" means ${plusPhysical}.`,
      cx - axisHalf,
      26
    );
  }, [a, b, r, convention]);

  const resultDirection = directionTextFromAlgebraic(r, convention);

  return (
    <section className="w-full max-w-3xl">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              1D Vector Addition (Sign Convention)
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Adjust A and B (−10 to +10). Toggle the sign convention to see how
              the <span className="font-medium">same numbers</span> can represent
              different physical directions.
            </p>
          </div>

          {/* Sign convention box (top-right) */}
          <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right">
            <div className="text-xs font-semibold text-slate-700">Sign convention</div>
            <div className="text-sm font-medium text-slate-900">
              {conventionLabel(convention)}
            </div>
            <button
              type="button"
              onClick={() =>
                setConvention((c) =>
                  c === "RIGHT_POSITIVE" ? "LEFT_POSITIVE" : "RIGHT_POSITIVE"
                )
              }
              className="mt-2 inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 active:scale-[0.99]"
            >
              Toggle convention
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div ref={wrapRef} className="px-4 pb-2 sm:px-5">
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg border border-slate-200 bg-white"
            aria-label="1D vector addition simulation canvas"
          />
        </div>

        {/* Controls */}
        <div className="grid gap-4 border-t border-slate-200 p-4 sm:grid-cols-2 sm:p-5">
          {/* Slider A */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Vector A</div>
              <div className="text-sm font-mono text-slate-900">
                {formatSigned(a)}
              </div>
            </div>

            <input
              type="range"
              min={-10}
              max={10}
              step={1}
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="mt-2 w-full"
              aria-label="Vector A magnitude slider"
            />

            <div className="mt-1 text-xs text-slate-600">
              Meaning: {formatSigned(a)} points{" "}
              <span className="font-semibold">
                {directionTextFromAlgebraic(a, convention) === "none"
                  ? "nowhere (zero)"
                  : directionTextFromAlgebraic(a, convention)}
              </span>{" "}
              under the current convention.
            </div>
          </div>

          {/* Slider B */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Vector B</div>
              <div className="text-sm font-mono text-slate-900">
                {formatSigned(b)}
              </div>
            </div>

            <input
              type="range"
              min={-10}
              max={10}
              step={1}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="mt-2 w-full"
              aria-label="Vector B magnitude slider"
            />

            <div className="mt-1 text-xs text-slate-600">
              Meaning: {formatSigned(b)} points{" "}
              <span className="font-semibold">
                {directionTextFromAlgebraic(b, convention) === "none"
                  ? "nowhere (zero)"
                  : directionTextFromAlgebraic(b, convention)}
              </span>{" "}
              under the current convention.
            </div>
          </div>
        </div>

        {/* Result readout */}
        <div className="border-t border-slate-200 p-4 sm:p-5">
          <div className="rounded-lg bg-white">
            <div className="text-sm font-semibold text-slate-900">
              Resultant Vector
            </div>

            <div className="mt-1 text-base text-slate-900">
              <span className="font-mono font-semibold">R = A + B = {formatSigned(r)}</span>{" "}
              {resultDirection === "none" ? (
                <span className="text-slate-700">(zero vector)</span>
              ) : (
                <span className="text-slate-700">
                  (to the {resultDirection})
                </span>
              )}
            </div>

            <div className="mt-2 text-sm text-slate-600">
              O-Level idea: once you choose a sign convention, **opposite directions**
              are handled by **+ / −**, so you can add vectors in 1D like signed numbers.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
