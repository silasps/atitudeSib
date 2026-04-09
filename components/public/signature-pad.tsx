"use client";

import { useEffect, useRef } from "react";

type SignaturePadProps = {
  onChange: (value: string) => void;
};

export function SignaturePad({ onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    const bounds = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
    canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
    context.scale(ratio, ratio);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, bounds.width, bounds.height);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2;
    context.strokeStyle = "#111827";
  }, []);

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const bounds = canvas.getBoundingClientRect();
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    onChange(canvas.toDataURL("image/png"));
  }

  function finishDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;

    if (!canvas) return;

    drawingRef.current = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    onChange(canvas.toDataURL("image/png"));
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const bounds = canvas.getBoundingClientRect();
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, bounds.width, bounds.height);
    onChange("");
  }

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-zinc-300 bg-white p-3">
        <canvas
          ref={canvasRef}
          className="h-44 w-full touch-none rounded-2xl bg-white"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={finishDrawing}
          onPointerLeave={finishDrawing}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearSignature}
          className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
        >
          Limpar assinatura
        </button>
      </div>
    </div>
  );
}
