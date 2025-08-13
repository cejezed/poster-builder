"use client";
import { useEffect, useState } from "react";

export default function Page() {
  // Builder state
  const [prompt, setPrompt] = useState("");
  const [imgUrl, setImgUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Tekst opties
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textAlign, setTextAlign] = useState("center"); // left | center | right
  const [textSize, setTextSize] = useState("medium");   // small | medium | large

  // Formaat/materiaal (simplified UI — pas uit indien nodig)
  const [shape, setShape] = useState("square"); // square | portrait | landscape
  const [material, setMaterial] = useState("paper");
  const [price, setPrice] = useState(0);

  // Voorbeelden (automatisch uit /public/examples via API)
  const [examples, setExamples] = useState([]);
  const [examplesError, setExamplesError] = useState(null);
  useEffect(() => {
    fetch("/api/examples", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Kan /api/examples niet laden"))))
      .then((data) => setExamples(Array.isArray(data?.files) ? data.files : []))
      .catch((err) => setExamplesError(err.message));
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setImgUrl(null);
    try {
      // stuur alleen shape mee; server kiest 1024x1024 / 1024x1536 / 1536x1024
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, shape }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");
      setImgUrl(data.imageUrl);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Preview aspect ratio naar vorm
  const aspect =
    shape === "square" ? "1 / 1" :
    shape === "landscape" ? "3 / 2" :
    "2 / 3";

  const fontSize =
    textSize === "small" ? 16 :
    textSize === "large" ? 32 : 24;

  return (
    <main className="container">
      <h1 style={{ fontSize: 30, margin: 0 }}>AI Poster Builder</h1>
      <p style={{ color: "#555", marginTop: 6, marginBottom: 18 }}>
        Grote preview, tekst uitlijning, kleur & grootte. Voorbeelden als één horizontale rij met scroll.
      </p>

      <div className="grid">
        {/* PREVIEW — nu links en groter */}
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Preview</h3>
          <div className="previewBox" style={{ aspectRatio: aspect }}>
            {imgUrl ? (
              <>
                <img src={imgUrl} alt="Preview" className="previewImg" />
                <div
                  className="overlayText"
                  style={{ color: textColor, textAlign, fontSize }}
                >
                  {text}
                </div>
                {/* Logo altijd zichtbaar, onderin midden */}
                <img
                  src="/logo.png"
                  alt="Logo"
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "110px",
                    opacity: 0.95
                  }}
                />
              </>
            ) : (
              <div style={{ color: "#888", padding: 12, textAlign: "center" }}>
                Nog geen afbeelding. Vul een prompt in en klik op <em>Genereer afbeelding</em>.
              </div>
            )}
          </div>
        </section>

        {/* CONTROLS — rechts */}
        <section className="card">
          <div className="field">
            <label><strong>Prompt voor afbeelding</strong></label>
            <textarea
              className="textarea"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Bijv. Minimalistische poster van een moderne villa in de duinen, warm avondlicht"
            />
          </div>

          <div className="row" style={{ marginTop: 8 }}>
            <label className="field" style={{ width: 160 }}>
              <span><strong>Vorm</strong></span>
              <select
                className="select"
                value={shape}
                onChange={(e) => setShape(e.target.value)}
              >
                <option value="square">Vierkant</option>
                <option value="portrait">Staand</option>
                <option value="landscape">Liggend</option>
              </select>
            </label>

            <label className="field" style={{ width: 180 }}>
              <span><strong>Materiaal</strong></span>
              <select
                className="select"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              >
                <option value="paper">Premium papier</option>
                <option value="canvas">Canvas</option>
                <option value="frame">Papier + lijst</option>
              </select>
            </label>

            <div className="price">Prijs: € {price.toFixed(2)}</div>
          </div>

          <div className="row" style={{ marginTop: 8, alignItems: "flex-end" }}>
            <label className="field" style={{ flex: 1 }}>
              <span><strong>Tekst op poster</strong></span>
              <input
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Bijv. Huis aan zee – 2025"
              />
            </label>

            <label className="field" style={{ width: 140 }}>
              <span><strong>Kleur</strong></span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="input"
                style={{ padding: 0, height: 42 }}
              />
            </label>
          </div>

          <div className="row">
            <label className="field" style={{ width: 180 }}>
              <span><strong>Uitlijning</strong></span>
              <select className="select" value={textAlign} onChange={(e) => setTextAlign(e.target.value)}>
                <option value="left">Links</option>
                <option value="center">Midden</option>
                <option value="right">Rechts</option>
              </select>
            </label>

            <label className="field" style={{ width: 180 }}>
              <span><strong>Tekstgrootte</strong></span>
              <select className="select" value={textSize} onChange={(e) => setTextSize(e.target.value)}>
                <option value="small">Klein</option>
                <option value="medium">Middel</option>
                <option value="large">Groot</option>
              </select>
            </label>
          </div>

          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn" onClick={handleGenerate} disabled={loading || !prompt}>
              {loading ? "Genereren…" : "Genereer afbeelding"}
            </button>
          </div>

          {error && <div style={{ color: "#b00020", marginTop: 8 }}>Fout: {error}</div>}
        </section>
      </div>

      {/* VOORBEELDEN — één rij met horizontale scroll */}
      <section className="examplesSection">
        <h3 style={{ margin: "18px 0 10px" }}>Voorbeelden die we al maakten</h3>

        {examplesError && (
          <div style={{ color: "#b00020", marginBottom: 8 }}>
            Kan de lijst met voorbeelden niet laden: {examplesError}
          </div>
        )}

        {examples.length === 0 ? (
          <div style={{ color: "#666" }}>
            Nog geen voorbeelden gevonden. Zet posters in <code>/public/examples/</code>.
          </div>
        ) : (
          <div className="examplesRow">
            {examples.map((src, i) => (
              <button
                key={i}
                className="exampleItem"
                type="button"
                onClick={() => { setImgUrl(src); setError(null); }}
                title="Gebruik als preview"
              >
                <img className="exampleImg" src={src} alt={`Voorbeeld ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
