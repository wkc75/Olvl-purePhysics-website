"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Vec = { x: number; y: number };

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/**
 * Normalize angle into [0, 360)
 */
function normalizeDeg(angle: number) {
  const a = angle % 360;
  return a < 0 ? a + 360 : a;
}

function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

function mag(v: Vec) {
  return Math.hypot(v.x, v.y);
}

function angleDegFromComponents(v: Vec) {
  // atan2 gives [-180, 180], normalize to [0, 360)
  return normalizeDeg(radToDeg(Math.atan2(v.y, v.x)));
}

/**
 * Convert (magnitude, angleDeg) into math-coordinate components:
 * +x right, +y up.
 */
function componentsFromMagAngle(magnitude: number, angleDeg: number): Vec {
  const t = degToRad(angleDeg);
  return { x: magnitude * Math.cos(t), y: magnitude * Math.sin(t) };
}

/**
 * Canvas uses +y downward. Convert math point to canvas point.
 */
function toCanvasPoint(p: Vec): Vec {
  return { x: p.x, y: p.y };
}

export default function VectorAdditionHeadToTail() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // ===== Controls =====
  const [magA, setMagA] = useState(4);
  const [angleA, setAngleA] = useState(30);

  const [magB, setMagB] = useState(3);
  const [angleB, setAngleB] = useState(110);

  // ===== Derived vectors in MATH coordinates =====
  // Math coords: +x right, +y up.
  const vecA = useMemo(() => componentsFromMagAngle(magA, angleA), [magA, angleA]);
  const vecB = useMemo(() => componentsFromMagAngle(magB, angleB), [magB, angleB]);
  const vecR = useMemo(() => add(vecA, vecB), [vecA, vecB]);

  const resultantMagnitude = useMemo(() => mag(vecR), [vecR]);
  const resultantAngle = useMemo(() => angleDegFromComponents(vecR), [vecR]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Fixed origin (center-ish for clarity)
    const originCanvas: Vec = { x: W * 0.35, y: H * 0.65 };

    // Scale: 1 "unit" => pixels
    const scale = 30;

    // Helpers that work in CANVAS coords, but accept vectors in MATH coords.
    // We map math-y (up) to canvas-y (down) by flipping sign when plotting.
    const mapMathToCanvas = (startCanvas: Vec, vMath: Vec): Vec => {
      return {
        x: startCanvas.x + vMath.x * scale,
        y: startCanvas.y - vMath.y * scale, // flip y
      };
    };

    const drawDottedHorizontal = (start: Vec, lengthPx = 80) => {
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(15, 23, 42, 0.35)"; // slate-ish, subtle

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(start.x + lengthPx, start.y);
      ctx.stroke();
      ctx.restore();
    };

    const drawArrow = (
      from: Vec,
      to: Vec,
      options: { stroke: string; width: number; headSize?: number }
    ) => {
      const headSize = options.headSize ?? 10;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const ang = Math.atan2(dy, dx);

      ctx.save();
      ctx.strokeStyle = options.stroke;
      ctx.fillStyle = options.stroke;
      ctx.lineWidth = options.width;
      ctx.lineCap = "round";

      // shaft
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // head (triangle)
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(
        to.x - headSize * Math.cos(ang - Math.PI / 7),
        to.y - headSize * Math.sin(ang - Math.PI / 7)
      );
      ctx.lineTo(
        to.x - headSize * Math.cos(ang + Math.PI / 7),
        to.y - headSize * Math.sin(ang + Math.PI / 7)
      );
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    /**
     * Draw a "double arrow" resultant using two chevrons at the end (>>).
     * This is intentionally a teaching-friendly symbol style, not an engineering standard.
     */
    const drawDoubleArrow = (
      from: Vec,
      to: Vec,
      options: { stroke: string; width: number; chevronSize?: number; chevronAngleRad?: number }
    ) => {
      const chevronSize = options.chevronSize ?? 10;
      const chevronAngle = options.chevronAngleRad ?? Math.PI / 8;

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const ang = Math.atan2(dy, dx);

      ctx.save();
      ctx.strokeStyle = options.stroke;
      ctx.lineWidth = options.width;
      ctx.lineCap = "round";

      // main shaft
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Two chevrons at the end: >> (two V-shapes)
      // Chevron 1 (outer)
      const drawChevronAt = (tip: Vec, backOffset: number) => {
        const base: Vec = {
          x: tip.x - backOffset * Math.cos(ang),
          y: tip.y - backOffset * Math.sin(ang),
        };

        const left: Vec = {
          x: base.x - chevronSize * Math.cos(ang - chevronAngle),
          y: base.y - chevronSize * Math.sin(ang - chevronAngle),
        };
        const right: Vec = {
          x: base.x - chevronSize * Math.cos(ang + chevronAngle),
          y: base.y - chevronSize * Math.sin(ang + chevronAngle),
        };

        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      };

      drawChevronAt(to, 0);        // first chevron at tip
      drawChevronAt(to, 10);       // second chevron slightly behind

      ctx.restore();
    };

    /**
     * Draw angle arc + label for a vector.
     * Angle shown is measured from +x (to the right) at the starting point.
     */
    const drawAngleArc = (start: Vec, vecEnd: Vec, label: string) => {
      const radius = 22;

      const dx = vecEnd.x - start.x;
      const dy = vecEnd.y - start.y;

      // In canvas coords: atan2(dy, dx) gives angle from +x, with +y down.
      const theta = Math.atan2(dy, dx);

      // Arc should go from 0 (horizontal) to theta.
      // For display clarity, we always arc in the direction of theta, not full 360.
      ctx.save();
      ctx.strokeStyle = "rgba(15, 23, 42, 0.55)";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, theta, theta < 0);
      ctx.stroke();

      // Label position roughly mid-arc
      const mid = theta / 2;
      const lx = start.x + (radius + 10) * Math.cos(mid);
      const ly = start.y + (radius + 10) * Math.sin(mid);

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.font = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(label, lx, ly);

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Light background guide (optional but helps learners)
      ctx.save();
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // --- HEAD-TO-TAIL POSITIONS ---
      // A from origin
      const headA = mapMathToCanvas(originCanvas, vecA);

      // B from head of A
      const headB = mapMathToCanvas(headA, vecB);

      // Resultant from origin to headB (same as origin + (A+B))
      const headR = headB;

      // --- Teaching aids: dotted horizontals + angle arcs ---
      // For A
      drawDottedHorizontal(originCanvas, 90);
      drawAngleArc(originCanvas, headA, `${normalizeDeg(angleA).toFixed(0)}°`);

      // For B (angle measured from B's own start point)
      drawDottedHorizontal(headA, 90);
      drawAngleArc(headA, headB, `${normalizeDeg(angleB).toFixed(0)}°`);

      // --- Draw vectors ---
      drawArrow(originCanvas, headA, { stroke: "#2563eb", width: 3, headSize: 11 }); // blue
      drawArrow(headA, headB, { stroke: "#16a34a", width: 3, headSize: 11 });       // green

      drawDoubleArrow(originCanvas, headR, {
        stroke: "#b91c1c", // red
        width: 4,
        chevronSize: 9,
      });

      // Labels near arrows (clear but not noisy)
      ctx.save();
      ctx.font = "13px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillStyle = "#0f172a";

      const labelNear = (from: Vec, to: Vec, text: string) => {
        const mid: Vec = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
        ctx.fillText(text, mid.x + 6, mid.y - 6);
      };

      labelNear(originCanvas, headA, "A");
      labelNear(headA, headB, "B");
      labelNear(originCanvas, headR, "R");

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    // Use RAF to keep interaction smooth while dragging sliders
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [vecA, vecB, angleA, angleB]); // depends only on what changes drawing

  return (
    <div className="w-full max-w-4xl space-y-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Head-to-Tail Vector Addition</h2>
        <p className="text-sm text-slate-600">
          Vector <span className="font-semibold text-blue-600">A</span> starts at the origin.
          Vector <span className="font-semibold text-green-600">B</span> starts at the head of A.
          The resultant <span className="font-semibold text-red-700">R</span> goes from the origin to the final point.
        </p>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="flex-1">
            <canvas
              ref={canvasRef}
              width={520}
              height={360}
              className="w-full rounded-lg border bg-white"
            />
          </div>

          <div className="w-full lg:w-80 space-y-3">
            {/* Result boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Resultant Magnitude</div>
                <div className="text-xl font-semibold text-slate-900">
                  {resultantMagnitude.toFixed(2)}
                </div>
              </div>
              <div className="rounded-lg border bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Resultant Angle</div>
                <div className="text-xl font-semibold text-slate-900">
                  {resultantAngle.toFixed(1)}°
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-lg border p-3">
              <div className="text-sm font-semibold text-slate-900">Vector A (blue)</div>

              <label className="mt-2 block text-xs text-slate-600">
                Magnitude: <span className="font-semibold">{magA}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={magA}
                onChange={(e) => setMagA(Number(e.target.value))}
                className="w-full"
              />

              <label className="mt-3 block text-xs text-slate-600">
                Angle (°): <span className="font-semibold">{angleA}</span>
              </label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={angleA}
                onChange={(e) => setAngleA(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-sm font-semibold text-slate-900">Vector B (green)</div>

              <label className="mt-2 block text-xs text-slate-600">
                Magnitude: <span className="font-semibold">{magB}</span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={magB}
                onChange={(e) => setMagB(Number(e.target.value))}
                className="w-full"
              />

              <label className="mt-3 block text-xs text-slate-600">
                Angle (°): <span className="font-semibold">{angleB}</span>
              </label>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={angleB}
                onChange={(e) => setAngleB(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="text-xs text-slate-500">
              Angles are measured from the dotted horizontal reference line at each vector’s start point.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
