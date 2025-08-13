"use client";
import { useEffect, useMemo, useState } from "react";

// ... hier komen je bestaande constants en arrays (SHAPES, SIZE_OPTIONS, MATERIALS, TEXT_SIZES)

export default function Page() {
  const [prompt, setPrompt] = useState("");
  // ... alle andere bestaande useState hooks

  const [examples, setExamples] = useState([]);
  const [examplesError, setExamplesError] = useState(null);

  useEffect(() => {
    fetch("/api/examples", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Kan /api/examples niet laden"))))
      .then((data) => setExamples(Array.isArray(data?.files) ? data.files : []))
      .catch((err) => setExamplesError(err.message));
  }, []);

  // ... rest van je bestaande functies zoals handleGenerate, handleOrder, gradientStyle, alignToFlex

  return (
    <main className="container">
      {/* bestaande UI en preview-sectie */}

      {/* Voorbeelden sectie */}
      <section className="examplesSection">
        <h3 style={{ margin: "18px 0 10px" }}>Voorbeelden die we al maakten</h3>

        {examplesError && (
          <div style={{ color: "#b00020", marginBottom: 8 }}>
            Kan de lijst met voorbeelden niet laden: {examplesError}
          </div>
        )}

        {examples.length === 0 ? (
          <div style={{ color: "#666" }}>Nog geen voorbeelden gevonden.</div>
        ) : (
          <div className="examplesScroll">
            <div className="examplesGrid">
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
          </div>
        )}
      </section>
    </main>
  );
}
