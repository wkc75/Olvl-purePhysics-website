"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Vec2 = { x: number; y: number };

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

/**
 * VectorResolutionSimulation
 *
 * Canvas-based simulation to teach resolving a vector into x- and y-components.
 *
 * Visual conventions:
 * - Angle measured from +x axis, anticlockwise (0°–360°)
 * - +y is drawn upwards on the canvas (we flip canvas y-axis for "math-style" view)
 * Components are drawn on their respective axes:
 *    Vx along the x-axis from the origin
 *    Vy along the y-axis from the origin
 *
 * The main vector is the resultant of these components.

 */
export default function VectorResolutionSimulation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Controls
  const [magnitude, setMagnitude] = useState<number>(6);
  const [angleDeg, setAngleDeg] = useState<number>(35);

  // Canvas CSS size (responsive)
  const [cssSize, setCssSize] = useState<{ w: number; h: number }>({
    w: 720,
    h: 460,
  });

  // Keep canvas sized to container
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setCssSize({
        w: Math.max(360, Math.floor(cr.width)),
        h: Math.max(320, Math.floor(cr.height)),
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const computed = useMemo(() => {
    // Convert to radians
    const theta = degToRad(angleDeg);

    // Components in "math coordinates" (+y upwards)
    const vx = magnitude * Math.cos(theta);
    const vy = magnitude * Math.sin(theta);

    return { theta, vx, vy };
  }, [magnitude, angleDeg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // HiDPI scaling for crisp lines/text
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    canvas.style.width = `${cssSize.w}px`;
    canvas.style.height = `${cssSize.h}px`;
    canvas.width = Math.floor(cssSize.w * dpr);
    canvas.height = Math.floor(cssSize.h * dpr);

    // Work in CSS pixels, not device pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // ====== Drawing setup ======
    const W = cssSize.w;
    const H = cssSize.h;

    ctx.clearRect(0, 0, W, H);

    // Put origin in the middle-ish (slightly left/down gives space for labels)
    const origin: Vec2 = { x: Math.round(W * 0.38), y: Math.round(H * 0.62) };

    // Flip y-axis so +y is upwards (math/physics convention)
    // We'll draw in a transformed "world" space, then reset for UI text if needed.
    ctx.save();
    ctx.translate(origin.x, origin.y);
    ctx.scale(1, -1);

    // Pick a scale so max magnitude fits nicely
    // (You can later make this dynamic or add zoom controls.)
    const pxPerUnit = 32;

    // ====== Helpers ======
    function drawArrow(from: Vec2, to: Vec2, options: {
      strokeStyle: string;
      lineWidth?: number;
      dashed?: boolean;
      headLength?: number;
    }) {
      const { strokeStyle, lineWidth = 2, dashed = false, headLength = 10 } = options;

      ctx.save();
      ctx.strokeStyle = strokeStyle;
      ctx.fillStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(dashed ? [6, 6] : []);

      // Main line
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Arrowhead
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const ang = Math.atan2(dy, dx);

      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(
        to.x - headLength * Math.cos(ang - Math.PI / 7),
        to.y - headLength * Math.sin(ang - Math.PI / 7)
      );
      ctx.lineTo(
        to.x - headLength * Math.cos(ang + Math.PI / 7),
        to.y - headLength * Math.sin(ang + Math.PI / 7)
      );
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    function drawGrid() {
      const gridSpacing = 32; // px in world space (because we flipped y, still fine)
      const halfW = W; // we’re in translated coordinates, use large bounds
      const halfH = H;

      ctx.save();
      ctx.lineWidth = 1;

      // Subtle grid
      ctx.strokeStyle = "rgba(15, 23, 42, 0.10)"; // slate-ish, subtle
      ctx.setLineDash([]);

      // Vertical lines
      for (let x = -halfW; x <= halfW; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, -halfH);
        ctx.lineTo(x, halfH);
        ctx.stroke();
      }
      // Horizontal lines
      for (let y = -halfH; y <= halfH; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(-halfW, y);
        ctx.lineTo(halfW, y);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawAxes() {
      const axisLenX = Math.round(W * 0.55);
      const axisLenY = Math.round(H * 0.55);

      // Axes slightly bolder than grid
      ctx.save();
      ctx.strokeStyle = "rgba(15, 23, 42, 0.50)";
      ctx.fillStyle = "rgba(15, 23, 42, 0.50)";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      // x-axis
      drawArrow({ x: -axisLenX, y: 0 }, { x: axisLenX, y: 0 }, {
        strokeStyle: "rgba(15, 23, 42, 0.55)",
        lineWidth: 2,
        dashed: false,
        headLength: 12,
      });

      // y-axis
      drawArrow({ x: 0, y: -axisLenY }, { x: 0, y: axisLenY }, {
        strokeStyle: "rgba(15, 23, 42, 0.55)",
        lineWidth: 2,
        dashed: false,
        headLength: 12,
      });

      // Origin dot
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(15, 23, 42, 0.70)";
      ctx.fill();

      ctx.restore();
    }

    function drawRightAngleMarker(p: Vec2) {
      // A small L-shape at point p (world coordinates)
      const s = 14;
      ctx.save();
      ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + s, p.y);
      ctx.lineTo(p.x + s, p.y + s);
      ctx.stroke();

      ctx.restore();
    }

    function worldToCanvas(p: Vec2): Vec2 {
      // We're currently in world space with y flipped, so to place text later
      // we’ll convert by applying the inverse of the current transform:
      // canvasX = origin.x + p.x
      // canvasY = origin.y - p.y
      return { x: origin.x + p.x, y: origin.y - p.y };
    }

    function drawLabelAtWorldPoint(text: string, pWorld: Vec2, opts?: { dx?: number; dy?: number }) {
      const { dx = 10, dy = 10 } = opts || {};
      const pCanvas = worldToCanvas(pWorld);

      // Draw text in normal canvas space (not flipped)
      ctx.restore(); // back to normal coordinates
      ctx.save();

      ctx.font = "14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
      ctx.fillStyle = "rgba(15, 23, 42, 0.90)";
      ctx.textBaseline = "middle";

      ctx.fillText(text, pCanvas.x + dx, pCanvas.y + dy);

      // Re-enter world transform for the remaining drawing
      ctx.restore();
      ctx.save();
      ctx.translate(origin.x, origin.y);
      ctx.scale(1, -1);
    }

    // ====== Scene drawing ======
    drawGrid();
    drawAxes();

    // Main vector endpoint (world coordinates)
    const { vx, vy } = computed;
    const end: Vec2 = { x: vx * pxPerUnit, y: vy * pxPerUnit };

    // Component points
    const vxEnd: Vec2 = { x: vx * pxPerUnit, y : 0 };
    const vyEnd: Vec2 = { x : 0, y : vy * pxPerUnit };

    // Colors (simple, consistent)
    const mainColor = "rgba(59, 130, 246, 0.95)"; // blue-ish
    const compColor = "rgba(16, 185, 129, 0.95)"; // green-ish

   // Draw components first
    drawArrow({ x: 0, y: 0 }, vxEnd, {
    strokeStyle: compColor,
    lineWidth: 2,
    dashed: true,
    headLength: 10,
    });

    drawArrow({ x: 0, y: 0 }, vyEnd, {
    strokeStyle: compColor,
    lineWidth: 2,
    dashed: true,
    headLength: 10,
    });

    // Draw main vector
    drawArrow({ x: 0, y: 0 }, end, {
    strokeStyle: mainColor,
    lineWidth: 3,
    dashed: false,
    headLength: 12,
    });

    // ====== Labels (values near arrows) ======
    const magText = `V = ${magnitude.toFixed(2)} u`;
    const vxText = `Vₓ = ${computed.vx.toFixed(2)} u`;
    const vyText = `Vᵧ = ${computed.vy.toFixed(2)} u`;

    // Place labels near midpoints of each vector
    const midMain: Vec2 = { x: end.x * 0.55, y: end.y * 0.55 };
    const midVx: Vec2 = { x: vxEnd.x * 0.5, y: 0 };
    const midVy: Vec2 = { x: 0, y: vyEnd.y * 0.5 };


    // Note: drawLabelAtWorldPoint temporarily exits/re-enters the world transform safely.
    drawLabelAtWorldPoint(magText, midMain, { dx: 10, dy: -14 });
    drawLabelAtWorldPoint(vxText, midVx, { dx: 10, dy: -16 });
    drawLabelAtWorldPoint(vyText, midVy, { dx: 6, dy: 0 });


    // Small angle label near origin (optional but very helpful pedagogically)
    drawLabelAtWorldPoint(`θ = ${angleDeg.toFixed(0)}°`, { x: 10, y: 20 }, { dx: 10, dy: 0 });

    // Exit world transform cleanly
    ctx.restore();
  }, [cssSize.w, cssSize.h, magnitude, angleDeg, computed]);

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-slate-900">Vector Resolution (Components)</h2>
          <p className="text-sm text-slate-600">
            Adjust the magnitude and angle (measured from +x, anticlockwise). The vector is resolved into
            horizontal <span className="font-medium">Vₓ</span> and vertical <span className="font-medium">Vᵧ</span> components.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Canvas area */}
          <div
            ref={wrapRef}
            className="relative min-h-[320px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
          >
            <canvas ref={canvasRef} className="block h-full w-full" />
          </div>

          {/* Controls */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="space-y-5">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-800">Magnitude (u)</label>
                  <span className="text-sm tabular-nums text-slate-700">{magnitude.toFixed(2)} u</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.1}
                  value={magnitude}
                  onChange={(e) => setMagnitude(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-slate-500">
                  “u” = arbitrary units (you can relabel to N, m/s, etc. later).
                </p>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-800">Angle θ (degrees)</label>
                  <span className="text-sm tabular-nums text-slate-700">{angleDeg.toFixed(0)}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={angleDeg}
                  onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Angle is measured from the positive x-axis, anticlockwise (standard Physics convention).
                </p>
              </div>

              {/* Quick numeric readout */}
              <div className="rounded-lg bg-slate-50 p-3">
                <div className="text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span>V</span>
                    <span className="tabular-nums">{magnitude.toFixed(2)} u</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vₓ = V cosθ</span>
                    <span className="tabular-nums">{computed.vx.toFixed(2)} u</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vᵧ = V sinθ</span>
                    <span className="tabular-nums">{computed.vy.toFixed(2)} u</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Signs matter: if the vector points left, Vₓ is negative; if it points down, Vᵧ is negative.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
