"use client";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImg(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setImg(data.image);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      maxWidth: 720,
      margin: "40px auto",
      padding: "0 16px",
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>AI Poster – demo</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>
        Typ een beschrijving (prompt) en druk op Generate. Je afbeelding verschijnt hieronder.
      </p>

      <form onSubmit={handleGenerate} style={{
        display: "grid",
        gap: 12,
        background: "#fafafa",
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 16,
      }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Prompt</span>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="b.v. Een minimalistische poster van een moderne villa in de duinen, gouden uur"
            rows={4}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
            required
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Formaat</span>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ddd", width: 200 }}
          >
            <option value="512x512">512 x 512 (snel)</option>
            <option value="1024x1024">1024 x 1024 (aanbevolen)</option>
            <option value="2048x2048">2048 x 2048 (groot)</option>
          </select>
        </label>

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
          {loading ? "Bezig met genereren…" : "Generate"}
        </button>

        {error && (
          <div style={{ color: "#b00020" }}>Fout: {error}</div>
        )}
      </form>

      {img && (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Resultaat</h2>
          <img
            src={img}
            alt="Generated"
            style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid #eee" }}
          />
        </div>
      )}

      <p style={{ color: "#777", marginTop: 24 }}>
        Tip: test eerst <code>/api/health</code> om te checken of je deployment werkt.
      </p>
    </main>
  );
}
