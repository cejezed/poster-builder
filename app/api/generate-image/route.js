export const runtime = "nodejs";
import OpenAI from "openai";

export async function POST(req) {
  try {
    const { prompt, shape } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const size = pickSupportedSize(shape);

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

function pickSupportedSize(shape) {
  // Vierkant → 1024x1024, Staand → 1024x1536, Liggend → 1536x1024
  if (!shape) return "1024x1024";
  if (shape === "square") return "1024x1024";
  if (shape === "portrait") return "1024x1536";
  if (shape === "landscape") return "1536x1024";
  return "1024x1024";
}
