"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

export default function VectorAdditionSimulationParallelogram() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ✅ PRESERVED: state variables + slider structure
  const [magA, setMagA] = useState(4);
  const [angleA, setAngleA] = useState(30);

  const [magB, setMagB] = useState(3);
  const [angleB, setAngleB] = useState(110);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ===============================
    // MODIFIED: make origin always centered
    // ===============================
    const W = canvas.width;
    const H = canvas.height;
    const origin: Point = { x: W / 2, y: H / 2 };

    // Scale: pixels per "unit" of magnitude
    const scale = 30;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // ===============================
    // NEW helper: degrees → radians
    // ===============================
    function degToRad(deg: number) {
      return (deg * Math.PI) / 180;
    }

    // ===============================
    // NEW helper: convert (mag, angle) to a canvas-space vector (dx, dy)
    // Physics convention: +y is UP, so we flip dy (canvas +y is down)
    // ===============================
    function vecFromMagAngle(mag: number, angleDeg: number) {
      const a = degToRad(angleDeg);
      const dx = mag * scale * Math.cos(a);
      const dy = mag * scale * Math.sin(a);
      return { dx, dy: -dy }; // flip y so positive physics y points up
    }

    // ===============================
    // NEW helper: draw a single arrow (shaft + triangular head)
    // Explains geometry:
    // - Arrowhead points along the direction from start → end
    // - We compute the direction angle using atan2(dy, dx)
    // - Then we build two side points by rotating ±theta from the backward direction
    // ===============================
    function drawArrow(
      start: Point,
      end: Point,
      color: string,
      lineWidth = 3,
      dashed = false,
      alpha = 1
    ) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.hypot(dx, dy);

      // Guard: tiny vectors still draw a dot-ish short arrow
      const safeLen = Math.max(len, 0.0001);

      // Arrowhead size scales with vector length, but is clamped to look reasonable
      const headLen = Math.max(10, Math.min(18, safeLen * 0.18));
      const headAngle = degToRad(28); // how “wide” the arrowhead spreads

      // Direction angle of the arrow shaft
      const angle = Math.atan2(dy, dx);

      // Head tip is at end.
      // Two base points are computed by going backwards from the tip,
      // then rotating left/right by headAngle.
      const x1 = end.x - headLen * Math.cos(angle - headAngle);
      const y1 = end.y - headLen * Math.sin(angle - headAngle);
      const x2 = end.x - headLen * Math.cos(angle + headAngle);
      const y2 = end.y - headLen * Math.sin(angle + headAngle);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;

      if (dashed) ctx.setLineDash([6, 6]);
      else ctx.setLineDash([]);

      // Shaft
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Arrowhead (filled triangle)
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // ===============================
    // NEW helper: draw light grid + axes (optional but helps learning)
    // ===============================
    function drawAxesAndGrid() {
      ctx.save();

      // Light grid
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      ctx.setLineDash([]);

      const step = 30; // matches scale nicely
      for (let x = 0; x <= W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 2;

      // x-axis
      ctx.beginPath();
      ctx.moveTo(0, origin.y);
      ctx.lineTo(W, origin.y);
      ctx.stroke();

      // y-axis
      ctx.beginPath();
      ctx.moveTo(origin.x, 0);
      ctx.lineTo(origin.x, H);
      ctx.stroke();

      ctx.restore();
    }

    drawAxesAndGrid();

    // ===============================
    // MODIFIED: compute endpoints for A and B (from common origin)
    // ===============================
    const a = vecFromMagAngle(magA, angleA);
    const b = vecFromMagAngle(magB, angleB);

    const headA: Point = { x: origin.x + a.dx, y: origin.y + a.dy };
    const headB: Point = { x: origin.x + b.dx, y: origin.y + b.dy };

    // ===============================
    // MODIFIED: compute resultant using components (Rx, Ry)
    // Resultant endpoint is the opposite corner of parallelogram:
    // origin + A + B
    // ===============================
    const rx = a.dx + b.dx;
    const ry = a.dy + b.dy;
    const headR: Point = { x: origin.x + rx, y: origin.y + ry };

    // ===============================
    // MODIFIED: draw vectors as proper arrows
    // Colors:
    // A: blue, B: green, Resultant: red
    // ===============================
    drawArrow(origin, headA, "#2563eb", 3.5, false, 1); // blue
    drawArrow(origin, headB, "#16a34a", 3.5, false, 1); // green

    // ===============================
    // NEW: draw parallelogram construction (translated copies)
    // School method:
    // - Copy A to start at head of B
    // - Copy B to start at head of A
    // These two copies form the missing sides of the parallelogram.
    // ===============================
    const headB_plus_A: Point = { x: headB.x + a.dx, y: headB.y + a.dy }; // should equal headR
    const headA_plus_B: Point = { x: headA.x + b.dx, y: headA.y + b.dy }; // should equal headR

    // Light / dashed translated vectors (visually “construction lines”)
    drawArrow(headB, headB_plus_A, "#2563eb", 2.5, true, 0.45); // A translated from head of B
    drawArrow(headA, headA_plus_B, "#16a34a", 2.5, true, 0.45); // B translated from head of A

    // ===============================
    // NEW: draw resultant as the diagonal of the parallelogram
    // (emphasised: thicker + strong red)
    // ===============================
    drawArrow(origin, headR, "#dc2626", 5, false, 1); // red

    // ===============================
    // NEW: label magnitudes (optional, but nice pedagogically)
    // ===============================
    function drawLabel(text: string, p: Point) {
      ctx.save();
      ctx.font = "14px ui-sans-serif, system-ui";
      ctx.fillStyle = "rgba(0,0,0,0.75)";
      ctx.fillText(text, p.x + 8, p.y - 8);
      ctx.restore();
    }

    // Magnitudes in “units” (not pixels)
    const rMag = Math.hypot(rx, ry) / scale;
    const rAngle = (Math.atan2(-ry, rx) * 180) / Math.PI; // convert back to physics angle (+y up)
    const rAngleNorm = (rAngle + 360) % 360;

    drawLabel(`A = ${magA.toFixed(1)}`, headA);
    drawLabel(`B = ${magB.toFixed(1)}`, headB);
    drawLabel(`R = ${rMag.toFixed(2)} @ ${rAngleNorm.toFixed(1)}°`, headR);
  }, [magA, angleA, magB, angleB]);

  return (
    <div className="w-full max-w-3xl">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold">Vector Addition (Parallelogram Method)</h3>
        <p className="mt-1 text-sm text-slate-600">
          Adjust vectors A and B. The dashed arrows form the parallelogram; the red diagonal is the resultant.
        </p>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start">
          <canvas
            ref={canvasRef}
            width={520}
            height={420}
            className="w-full rounded-lg border border-slate-200 bg-slate-50"
          />

          {/* ✅ PRESERVED: sliders + state variables (same idea, just nicer layout) */}
          <div className="w-full md:w-72">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-800">Vector A (blue)</div>

              <label className="mt-2 block text-xs text-slate-600">
                Magnitude: <span className="font-mono">{magA.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={magA}
                onChange={(e) => setMagA(Number(e.target.value))}
                className="w-full"
              />

              <label className="mt-3 block text-xs text-slate-600">
                Angle (°): <span className="font-mono">{angleA}</span>
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

            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-800">Vector B (green)</div>

              <label className="mt-2 block text-xs text-slate-600">
                Magnitude: <span className="font-mono">{magB.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={magB}
                onChange={(e) => setMagB(Number(e.target.value))}
                className="w-full"
              />

              <label className="mt-3 block text-xs text-slate-600">
                Angle (°): <span className="font-mono">{angleB}</span>
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

            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">What to look for</div>
              <ul className="mt-1 list-disc pl-5">
                <li>Dashed arrows are “copies” placed head-to-tail to form the parallelogram.</li>
                <li>The red diagonal from the origin is the resultant vector.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
