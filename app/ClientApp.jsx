"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ClientApp() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <TopBar />
      <Hero />
      <Builder />
      <BottomBar />
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
        <div className="text-xl font-black tracking-tight">PosterBuilder</div>
        <nav className="hidden sm:flex ml-6 text-sm text-neutral-600 gap-4">
          <span className="font-medium">1. Ontwerp</span>
          <span>2. Opties</span>
          <span>3. Bestellen</span>
        </nav>
        <div className="ml-auto text-xs text-neutral-500">Gemaakt voor snelle personalisatie</div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-b from-white to-neutral-50 border-b">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Maak je eigen gepersonaliseerde poster</h1>
        <p className="mt-2 text-neutral-600 max-w-2xl">
          Voer je idee in, bekijk direct een voorbeeld, voeg een persoonlijke tekst toe en bestel in een paar klikken.
        </p>
      </div>
    </section>
  );
}

// ----- Data -----
const SHAPES = [
  { id: "square", label: "Vierkant" },
  { id: "rect", label: "Rechthoek" },
];

const SIZE_OPTIONS = {
  square: [
    { id: "sq-200", label: "20×20 cm", widthMm: 200, heightMm: 200, basePrice: 16 },
    { id: "sq-300", label: "30×30 cm", widthMm: 300, heightMm: 300, basePrice: 22 },
    { id: "sq-400", label: "40×40 cm", widthMm: 400, heightMm: 400, basePrice: 29 },
  ],
  rect: [
    { id: "r-210-297", label: "A4 (21×29.7 cm)", widthMm: 210, heightMm: 297, basePrice: 18 },
    { id: "r-300-400", label: "30×40 cm", widthMm: 300, heightMm: 400, basePrice: 26 },
    { id: "r-400-500", label: "40×50 cm", widthMm: 400, heightMm: 500, basePrice: 34 },
  ],
};

const MATERIALS = [
  { id: "paper", label: "Premium Mat Papier", multiplier: 1 },
  { id: "canvas", label: "Canvas", multiplier: 1.45 },
];

const FRAME_OPTIONS = [
  { id: "noframe", label: "Zonder lijst", extra: 0 },
  { id: "blackwood", label: "Lijst – Zwart hout", extra: 19 },
  { id: "oak", label: "Lijst – Eiken", extra: 22 },
];

// ----- Builder -----
function Builder() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [overlayText, setOverlayText] = useState("");

  const [shape, setShape] = useState("square");
  const [sizeId, setSizeId] = useState(SIZE_OPTIONS.square[0].id);
  const [material, setMaterial] = useState("paper");
  const [frame, setFrame] = useState("noframe");

  const canvasRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const size = useMemo(() => {
    const list = SIZE_OPTIONS[shape];
    return list.find((s) => s.id === sizeId) || list[0];
  }, [shape, sizeId]);

  useEffect(() => {
    const list = SIZE_OPTIONS[shape];
    if (!list.find((s) => s.id === sizeId)) setSizeId(list[0].id);
  }, [shape]); // eslint-disable-line react-hooks/exhaustive-deps

  const price = useMemo(() => {
    const mult = (MATERIALS.find((m) => m.id === material) || {}).multiplier || 1;
    const frameExtra = (FRAME_OPTIONS.find((f) => f.id === frame) || {}).extra || 0;
    return Math.round((size.basePrice * mult + frameExtra) * 100) / 100;
  }, [size, material, frame]);

  const pxDims = useMemo(() => mmToPixels(size.widthMm, size.heightMm, 300), [size]);

  async function onGenerate() {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const r = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width: pxDims.width, height: pxDims.height }),
      });
      const data = await r.json();
      if (data && data.imageUrl) setImageUrl(data.imageUrl);
      else throw new Error("No imageUrl");
    } catch {
      setImageUrl(
        `https://picsum.photos/${Math.max(pxDims.width, 512)}/${Math.max(pxDims.height, 512)}?random=${encodeURIComponent(prompt)}`
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function exportPNG() {
    if (!imageUrl) return;
    setExporting(true);
    try {
      const img = await loadImage(imageUrl);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = pxDims.width;
      canvas.height = pxDims.height;
      drawCoverImage(ctx, img, canvas.width, canvas.height);
      const margin = Math.round(canvas.height * 0.06);
      const textBoxWidth = Math.round(canvas.width * 0.8);
      const fontSize = Math.max(24, Math.round(canvas.height * 0.035));
      ctx.font = `${fontSize}px Inter, ui-sans-serif, system-ui`;
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      if (overlayText.trim()) {
        drawMultilineCentered(ctx, overlayText.trim(), canvas.width / 2, canvas.height - margin, textBoxWidth, fontSize * 1.2);
      }
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `poster-${size.label.replace(/\s+/g, "_")}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  const canExport = Boolean(imageUrl);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Panel title="1. Afbeelding genereren" desc="Schrijf je idee, klik daarna op ‘Genereer’.">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Bijv. Minimalistische skyline bij zonsondergang, warme pastelkleuren"
            className="w-full min-h-[96px] rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <div className="mt-3 flex gap-3">
            <Button onClick={onGenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? "Bezig…" : "Genereer afbeelding"}
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                setImageUrl(
                  `https://picsum.photos/${Math.max(pxDims.width, 512)}/${Math.max(pxDims.height, 512)}?random=${Date.now()}`
                )
              }
            >
              Test met voorbeeld
            </Button>
          </div>
        </Panel>

        <Panel title="2. Persoonlijke tekst" desc="Komt vast onderaan, mooi gecentreerd.">
          <input
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            type="text"
            placeholder="Bijv. Voor oma – 2025"
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </Panel>

        <Panel title="3. Formaat & materiaal" desc="Kies vorm, afmeting, materiaal en lijst.">
          <div className="flex gap-2 mb-3">
            {SHAPES.map((s) => (
              <Pill key={s.id} active={shape === s.id} onClick={() => setShape(s.id)} label={s.label} />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {SIZE_OPTIONS[shape].map((s) => (
              <OptionTile key={s.id} active={sizeId === s.id} onClick={() => setSizeId(s.id)}>
                <div className="font-medium">{s.label}</div>
                <div className="text-xs text-neutral-500">v.a. € {s.basePrice.toFixed(2)}</div>
              </OptionTile>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Materiaal"
              value={material}
              onChange={(v) => setMaterial(v)}
              options={MATERIALS.map((m) => ({ value: m.id, label: m.label }))}
            />
            <Select
              label="Lijst"
              value={frame}
              onChange={(v) => setFrame(v)}
              options={FRAME_OPTIONS.map((f) => ({ value: f.id, label: `${f.label}${f.extra ? ` (+€ ${f.extra})` : ""}` }))}
            />
          </div>
        </Panel>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-500">Totaal</div>
            <div className="text-2xl font-bold">€ {price.toFixed(2)}</div>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportPNG} disabled={!canExport || exporting}>{exporting ? "Exporteren…" : "Exporteer PNG"}</Button>
            <Button variant="secondary" disabled={!canExport} onClick={() => alert("Koppel je checkout hier.")}>
              Bestellen
            </Button>
          </div>
        </div>
      </div>

      {/* Right: preview */}
      <div className="lg:sticky lg:top-20 self-start">
        <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="border-b p-4">
            <div className="font-semibold">Voorbeeld</div>
            <div className="text-xs text-neutral-500">Live weergave van je poster</div>
          </div>
          <div className="p-4">
            <div
              className="w-full bg-neutral-100 rounded-2xl overflow-hidden border relative"
              style={{ aspectRatio: shape === "square" ? "1 / 1" : `${size.widthMm} / ${size.heightMm}` }}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-neutral-400 text-sm">Nog geen afbeelding</div>
              )}

              {overlayText && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-[80%] text-center text-neutral-900/90">
                  <div className="line-clamp-3 text-ellipsis break-words font-medium" style={{ fontSize: shape === "square" ? "clamp(14px,2.8vw,24px)" : "clamp(14px,2.4vw,24px)" }}>
                    {overlayText}
                  </div>
                </div>
              )}

              {frame !== "noframe" && <div className="pointer-events-none absolute inset-0 m-3 rounded-xl" style={{ boxShadow: "inset 0 0 0 6px rgba(0,0,0,0.5)" }} />}
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </section>
  );
}

// UI primitives
function Panel({ title, desc, children }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4">
      <div className="mb-3">
        <div className="font-semibold">{title}</div>
        {desc && <div className="text-xs text-neutral-500 mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );
}
function Button({ children, onClick, disabled, variant = "primary" }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = variant === "primary" ? "bg-black text-white hover:bg-black/90" : variant === "secondary" ? "bg-neutral-200 hover:bg-neutral-300" : "bg-transparent hover:bg-neutral-100";
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>{children}</button>
  );
}
function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm border transition ${active ? "bg-black text-white border-black" : "bg-white hover:bg-neutral-50 border-neutral-200"}`}>
      {label}
    </button>
  );
}
function OptionTile({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`rounded-xl border p-3 text-left transition ${active ? "border-black ring-1 ring-black" : "border-neutral-200 hover:border-neutral-300"}`}>
      {children}
    </button>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-neutral-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

// Helpers
function mmToPixels(wMm, hMm, ppi = 300) {
  const inchesW = wMm / 25.4;
  const inchesH = hMm / 25.4;
  return { width: Math.round(inchesW * ppi), height: Math.round(inchesH * ppi) };
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
function drawCoverImage(ctx, img, cw, ch) {
  const ir = img.width / img.height;
  const cr = cw / ch;
  let dw = cw, dh = ch;
  if (ir > cr) { dh = ch; dw = Math.round(dh * ir); }
  else { dw = cw; dh = Math.round(dw / ir); }
  const dx = Math.round((cw - dw) / 2);
  const dy = Math.round((ch - dh) / 2);
  ctx.drawImage(img, dx, dy, dw, dh);
}
function drawMultilineCentered(ctx, text, centerX, baselineY, maxWidth, lineHeight) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const total = lines.length * lineHeight;
  let y = baselineY - total;
  for (const l of lines) {
    ctx.fillText(l, centerX, y + lineHeight);
    y += lineHeight;
  }
}
