"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [imgUrl, setImgUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [textAlign, setTextAlign] = useState("center");
  const [textSize, setTextSize] = useState("medium");
  const [shape, setShape] = useState("square");
  const [material, setMaterial] = useState("paper");
  const [price, setPrice] = useState(0);

  const [examples, setExamples] = useState([]);
  const [examplesError, setExamplesError] = useState(null);

  useEffect(() => {
    fetch("/api/examples", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Kan /api/examples niet laden"))))
      .then((data) => setExamples(Array.isArray(data?.files) ? data.files : []))
      .catch((err) => setExamplesError(err.message));
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width: shape === "square" ? 1024 : shape === "landscape" ? 1536 : 1024, height: shape === "square" ? 1024 : shape === "landscape" ? 1024 : 1536 }),
      });
      if (!res.ok) throw new Error("Image generation failed");
      const data = await res.json();
      setImgUrl(data.imageUrl);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="grid">
        <div className="card">
          <div className="field">
            <label>Prompt voor afbeelding</label>
            <input className="input" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
          <div className="space" />
          <button className="btn" onClick={handleGenerate} disabled={loading || !prompt}>
            {loading ? "Genereren..." : "Genereer afbeelding"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="space" />
          <div className="field">
            <label>Tekst op poster</label>
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="field">
            <label>Kleur</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
          </div>
          <div className="field">
            <label>Uitlijning</label>
            <select className="select" value={textAlign} onChange={(e) => setTextAlign(e.target.value)}>
              <option value="left">Links</option>
              <option value="center">Midden</option>
              <option value="right">Rechts</option>
            </select>
          </div>
          <div className="field">
            <label>Tekstgrootte</label>
            <select className="select" value={textSize} onChange={(e) => setTextSize(e.target.value)}>
              <option value="small">Klein</option>
              <option value="medium">Middel</option>
              <option value="large">Groot</option>
            </select>
          </div>
        </div>

        <div className="previewBox">
          {imgUrl ? (
            <>
              <img src={imgUrl} alt="preview" className="previewImg" />
              <div className="overlayText" style={{ color: textColor, textAlign: textAlign, fontSize: textSize === "small" ? "16px" : textSize === "medium" ? "24px" : "32px" }}>
                {text}
              </div>
              <img src="/logo.png" alt="logo" style={{ position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", width: "80px" }} />
            </>
          ) : (
            <p>Geen afbeelding</p>
          )}
        </div>
      </div>

      <section className="examplesSection">
        <h3 style={{ margin: "18px 0 10px" }}>Voorbeelden die we al maakten</h3>
        {examplesError && <div style={{ color: "#b00020" }}>Kan de lijst met voorbeelden niet laden: {examplesError}</div>}
        {examples.length === 0 ? (
          <div style={{ color: "#666" }}>Nog geen voorbeelden gevonden.</div>
        ) : (
          <div className="examplesScroll">
            <div className="examplesGrid">
              {examples.map((src, i) => (
                <button key={i} className="exampleItem" type="button" onClick={() => { setImgUrl(src); setError(null); }}>
                  <img className="exampleImg" src={src} alt={`Voorbeeld ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
