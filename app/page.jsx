"use client";
import { useMemo, useState } from "react";

const SHAPES = [
  { key: "square", label: "Vierkant" },
  { key: "portrait", label: "Staand (rechthoek)" },
  { key: "landscape", label: "Liggend (rechthoek)" },
];

const SIZE_OPTIONS = {
  square: [
    { key: "20x20", label: "20×20 cm", w: 20, h: 20, base: 19.95 },
    { key: "30x30", label: "30×30 cm", w: 30, h: 30, base: 24.95 },
    { key: "50x50", label: "50×50 cm", w: 50, h: 50, base: 39.95 },
  ],
  portrait: [
    { key: "30x40", label: "30×40 cm", w: 30, h: 40, base: 29.95 },
    { key: "50x70", label: "50×70 cm", w: 50, h: 70, base: 49.95 },
    { key: "60x90", label: "60×90 cm", w: 60, h: 90, base: 69.95 },
  ],
  landscape: [
    { key: "40x30", label: "40×30 cm", w: 40, h: 30, base: 29.95 },
    { key: "70x50", label: "70×50 cm", w: 70, h: 50, base: 49.95 },
    { key: "90x60", label: "90×60 cm", w: 90, h: 60, base: 69.95 },
  ],
};

const MATERIALS = [
  { key: "paper", label: "Premium papier", multiplier: 1.0, add: 0 },
  { key: "canvas", label: "Canvas", multiplier: 1.25, add: 5 },
  { key: "frame", label: "Papier + lijst", multiplier: 1.15, add: 15 },
];

const TEXT_SIZES = {
  small: 16,
  medium: 24,
  large: 32,
};

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [shape, setShape] = useState("square");
  const [sizeKey, setSizeKey] = useState(SIZE_OPTIONS.square[1].key); // 30x30 default
  const [material, setMaterial] = useState("paper");
  const [text, setText] = useState("");
  const [multiColor, setMultiColor] = useState(false);
  const [textColors, setTextColors] = useState(["#111111"]); // voor gradient 2–3 kleuren
  const [textSizeKey, setTextSizeKey] = useState("medium");
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  const sizes = SIZE_OPTIONS[shape];
  const currentSize = sizes.find((s) => s.key === sizeKey) || sizes[0];

  const price = useMemo(() => {
    const base = currentSize?.base ?? 0;
    const mat = MATERIALS.find((m) => m.key === material) || MATERIALS[0];
    const p = base * mat.multiplier + mat.add;
    return Math.round(p * 100) / 100;
  }, [currentSize, material]);

  function gradientStyle() {
    if (!multiColor || textColors.length <= 1) return { color: textColors[0] || "#111" };
    const stops = textColors.join(", ");
    return {
      backgroundImage: `linear-gradient(90deg, ${stops})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    };
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImgUrl(null);
    setOrderResult(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, shape }), // server kiest geldige size obv shape
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Genereren mislukt");
      setImgUrl(data.imageUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleOrder() {
    setError(null);
    setOrderResult(null);
    try {
      const payload = {
        prompt,
        shape,
        size: currentSize?.key,
        material,
        text,
        textColors,
        multiColor,
        textSize: textSizeKey,
        price,
      };
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bestellen mislukt");
      setOrderResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  const previewAspect = shape === "square" ? "1 / 1" : shape === "portrait" ? "2 / 3" : "3 / 2"; // iets dynamischer, grote weergave
  const overlayFontSize = TEXT_SIZES[textSizeKey] || 24;

  return (
    <main className="container">
      <h1 style={{ fontSize: 30, margin: 0 }}>AI Poster Builder</h1>
      <p style={{ color: "#555", marginTop: 6, marginBottom: 18 }}>Mobiel‑vriendelijk. Grote preview. Meerkleurige tekst en tekstgrootte‑keuze.</p>

      <div className="grid">
        {/* Preview links, groter */}
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Preview</h3>
          <div className="previewBox" style={{ aspectRatio: previewAspect }}>
            {imgUrl ? (
              <>
                <img src={imgUrl} alt="Generated" className="previewImg" />
                {text && (
                  <div className="overlayText" style={{ ...gradientStyle(), fontSize: overlayFontSize }}>
                    {text}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "#888", padding: 12, textAlign: "center" }}>
                Nog geen afbeelding. Vul een prompt in en klik op <em>Genereer afbeelding</em>.
              </div>
            )}
          </div>

          <div className="row" style={{ marginTop: 16 }}>
            <button onClick={handleOrder} disabled={!imgUrl} className="btn">Bestellen</button>
            {orderResult && (
              <div style={{ color: "#0a7", fontWeight: 700 }}>Bestelling geplaatst! Order: {orderResult.orderId}</div>
            )}
          </div>
        </section>

        {/* Controls rechts */}
        <section className="card">
          <form onSubmit={handleGenerate} style={{ display: "grid", gap: 12 }}>
            <label className="field">
              <span><strong>1) Beschrijving (prompt)</strong></span>
              <textarea
                className="textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Bijv. Minimalistische poster van een moderne villa in de duinen, warm avondlicht"
                rows={4}
                required
              />
            </label>

            <div className="row">
              <label className="field" style={{ flex: 1 }}>
                <span><strong>2) Formaat</strong></span>
                <select className="select" value={shape} onChange={(e) => { const next = e.target.value; setShape(next); setSizeKey(SIZE_OPTIONS[next][0].key); }}>
                  {SHAPES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </label>

              <label className="field" style={{ flex: 1 }}>
                <span>&nbsp;</span>
                <select className="select" value={sizeKey} onChange={(e) => setSizeKey(e.target.value)}>
                  {SIZE_OPTIONS[shape].map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </label>
            </div>

            <label className="field">
              <span><strong>3) Materiaal</strong></span>
              <select className="select" value={material} onChange={(e) => setMaterial(e.target.value)}>
                {MATERIALS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </label>

            <div className="row" style={{ alignItems: "flex-end" }}>
              <label className="field" style={{ flex: 1 }}>
                <span><strong>4) Persoonlijke tekst</strong> (optioneel)</span>
                <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Bijv. Huis aan zee – 2025" />
              </label>
              <label className="field" style={{ width: 180 }}>
                <span><strong>Tekstgrootte</strong></span>
                <select className="select" value={textSizeKey} onChange={(e) => setTextSizeKey(e.target.value)}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
            </div>

            <div className="card" style={{ padding: 12, border: '1px dashed #ddd', background: '#fbfbfc' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>Tekstkleur</strong>
                <label className="row" style={{ gap: 6 }}>
                  <input type="checkbox" checked={multiColor} onChange={(e) => {
                    setMultiColor(e.target.checked);
                    if (e.target.checked && textColors.length === 1) setTextColors([textColors[0], '#ff0055']);
                    if (!e.target.checked) setTextColors([textColors[0] || '#111111']);
                  }} />
                  <span>Meerdere kleuren (gradient)</span>
                </label>
              </div>

              {/* Kleurenpickers */}
              {!multiColor ? (
                <div className="row" style={{ marginTop: 10 }}>
                  <input type="color" value={textColors[0]} onChange={(e) => setTextColors([e.target.value])} style={{ width: 44, height: 44, border: '1px solid #ddd', borderRadius: 8 }} />
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: 10, marginTop: 10 }}>
                  {textColors.map((c, idx) => (
                    <div key={idx} style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
                      <input type="color" value={c} onChange={(e) => setTextColors(textColors.map((v, i) => i === idx ? e.target.value : v))} style={{ width: 44, height: 44, border: '1px solid #ddd', borderRadius: 8 }} />
                      <button type="button" className="btn" style={{ padding: '6px 8px', background: '#eee', color: '#111' }} onClick={() => setTextColors(textColors.filter((_, i) => i !== idx))} disabled={textColors.length <= 2}>−</button>
                    </div>
                  ))}
                  {textColors.length < 3 && (
                    <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
                      <div style={{ width: 44, height: 44, border: '1px dashed #ccc', borderRadius: 8 }} />
                      <button type="button" className="btn" style={{ padding: '6px 8px', background: '#111', color: '#fff' }} onClick={() => setTextColors([...textColors, '#00b3ff'])}>+</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="row" style={{ marginTop: 6 }}>
              <button type="submit" disabled={loading} className="btn">{loading ? 'Bezig met genereren…' : 'Genereer afbeelding'}</button>
              <div className="price">Prijs: € {price.toFixed(2)}</div>
            </div>

            {error && <div style={{ color: '#b00020' }}>Fout: {error}</div>}
          </form>
        </section>
      </div>

      <p style={{ color: '#777', marginTop: 16 }}>Tip: voeg later opslag (S3/Supabase) toe om de afbeelding te bewaren en koppel Stripe Checkout voor betalingen.</p>
    </main>
  );
}
