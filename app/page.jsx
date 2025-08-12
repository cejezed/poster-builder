"use client";
import { useMemo, useState } from "react";

// Prijstabellen en opties
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

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [shape, setShape] = useState("square");
  const [sizeKey, setSizeKey] = useState(SIZE_OPTIONS.square[1].key); // default 30x30
  const [material, setMaterial] = useState("paper");
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#111111");
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  const sizes = SIZE_OPTIONS[shape];
  const currentSize = sizes.find((s) => s.key === sizeKey) || sizes[0];

  // Eenvoudige prijsberekening
  const price = useMemo(() => {
    const base = currentSize?.base ?? 0;
    const mat = MATERIALS.find((m) => m.key === material) || MATERIALS[0];
    const p = base * mat.multiplier + mat.add;
    return Math.round(p * 100) / 100;
  }, [currentSize, material]);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImgUrl(null);
    setOrderResult(null);

    try {
      // Kies een logische AI-resolutie obv gekozen postermaat; cap op 1024
      // (Grotere generaties zijn duurder/langzamer. 1024 is prima voor een demo.)
      const target = Math.max(currentSize.w, currentSize.h);
      const px = target >= 60 ? 1024 : target >= 40 ? 1024 : 512;

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, width: px, height: px }),
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
        textColor,
        price,
        // In productie zou je hier ook de gegenereerde afbeelding opslaan en de URL meesturen
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

  return (
    <main style={{ maxWidth: 1000, margin: "32px auto", padding: "0 16px", fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>AI Poster Builder</h1>
      <p style={{ color: "#555", marginTop: 6, marginBottom: 20 }}>
        Genereer een afbeelding met AI, voeg een persoonlijke tekst toe, kies formaat & materiaal en bestel.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Linkerkolom: Builder */}
        <section style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <form onSubmit={handleGenerate} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span><strong>1) Beschrijving (prompt)</strong></span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Bijv. Minimalistische poster van een moderne villa in de duinen, warm avondlicht"
                rows={4}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                required
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span><strong>2) Formaat</strong></span>
                <select
                  value={shape}
                  onChange={(e) => {
                    const next = e.target.value;
                    setShape(next);
                    setSizeKey(SIZE_OPTIONS[next][0].key);
                  }}
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                >
                  {SHAPES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>&nbsp;</span>
                <select
                  value={sizeKey}
                  onChange={(e) => setSizeKey(e.target.value)}
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                >
                  {sizes.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label style={{ display: "grid", gap: 6 }}>
              <span><strong>3) Materiaal</strong></span>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", maxWidth: 300 }}
              >
                {MATERIALS.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span><strong>4) Persoonlijke tekst</strong> (optioneel)</span>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Bijv. Huis aan zee – 2025"
                  style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span><strong>Tekstkleur</strong></span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ height: 42, borderRadius: 8, border: "1px solid #ddd" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "black",
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: 0,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Bezig met genereren…" : "Genereer afbeelding"}
              </button>
              <div style={{ marginLeft: "auto", fontWeight: 600 }}>
                Prijs: € {price.toFixed(2)}
              </div>
            </div>

            {error && (
              <div style={{ color: "#b00020" }}>Fout: {error}</div>
            )}
          </form>
        </section>

        {/* Rechterkolom: Preview */}
        <section style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Preview</h3>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: shape === "square" ? "1 / 1" : shape === "portrait" ? "3 / 4" : "4 / 3",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #ddd",
              background: "#fafafa",
              display: "grid",
              placeItems: "center",
            }}
          >
            {imgUrl ? (
              <>
                <img
                  src={imgUrl}
                  alt="Generated"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {/* Vaste positie voor tekst: onderin midden */}
                {text && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 12,
                      textAlign: "center",
                      fontSize: 18,
                      fontWeight: 600,
                      color: textColor,
                      textShadow: "0 1px 2px rgba(0,0,0,0.15)",
                      padding: "0 12px",
                      pointerEvents: "none",
                    }}
                  >
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

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              onClick={handleOrder}
              disabled={!imgUrl}
              style={{
                background: imgUrl ? "#0a7" : "#ccc",
                color: "white",
                padding: "10px 14px",
                borderRadius: 8,
                border: 0,
                cursor: imgUrl ? "pointer" : "not-allowed",
              }}
            >
              Bestellen
            </button>
            {orderResult && (
              <div style={{ color: "#0a7", fontWeight: 600 }}>
                Bestelling geplaatst! Order: {orderResult.orderId}
              </div>
            )}
          </div>
        </section>
      </div>

      <p style={{ color: "#777", marginTop: 20 }}>
        Tip: voor productie kun je de afbeelding opslaan (S3/Supabase), en payments toevoegen (bijv. Stripe Checkout).
      </p>
    </main>
  );
  }
