export const runtime = "nodejs";
import OpenAI from "openai";

export async function POST(req) {
  try {
    const { prompt, sizeKey } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const size = pickSupportedSize(sizeKey);

    const resp = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size
    });

    const b64 = resp.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(JSON.stringify({ error: "No image returned" }), { status: 500 });
    }

    const dataUrl = `data:image/png;base64,${b64}`;
    return new Response(JSON.stringify({ imageUrl: dataUrl }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    const msg = e?.message || "Image generation failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

function pickSupportedSize(sizeKey) {
  // Map de front‑end formaatkeuze naar een ondersteunde AI resolutie
  if (!sizeKey) return "1024x1024";
  if (sizeKey.includes("x")) {
    const [w, h] = sizeKey.split("x").map(Number);
    if (w === h) return "1024x1024";
    if (w > h) return "1536x1024"; // liggend
    if (h > w) return "1024x1536"; // staand
  }
  return "1024x1024";
}
