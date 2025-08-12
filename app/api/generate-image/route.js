export const runtime = "nodejs";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { prompt, width = 1024, height = 1024 } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const size = pickSize(width, height);

    const resp = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size
      // geen response_format meegeven; SDK retourneert b64_json standaard
    });

    const b64 = resp.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(JSON.stringify({ error: "No image returned" }), { status: 500 });
    }

    const dataUrl = `data:image/png;base64,${b64}`;
    return Response.json({ imageUrl: dataUrl });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Image generation failed";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

function pickSize(w: number, h: number) {
  const max = Math.max(w, h);
  if (max <= 256) return "256x256";
  if (max <= 512) return "512x512";
  if (max <= 1024) return "1024x1024";
  return "2048x2048";
}
