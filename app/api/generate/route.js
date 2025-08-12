import OpenAI from "openai";

export async function POST(req) {
  try {
    const { prompt, size } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY on server" }), {
        status: 500, headers: { "content-type": "application/json" }
      });
    }
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'prompt'" }), {
        status: 400, headers: { "content-type": "application/json" }
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const resp = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: size || "1024x1024",
      response_format: "b64_json",
    });

    const b64 = resp.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(JSON.stringify({ error: "No image returned from OpenAI" }), {
        status: 502, headers: { "content-type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ image: `data:image/png;base64,${b64}` }), {
      status: 200, headers: { "content-type": "application/json" }
    });
  } catch (err) {
    // Laat een veilige, maar nuttige fout zien
    const msg = (err && err.message) ? err.message : "Unknown error";
    const status = (err && err.status) ? err.status : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { "content-type": "application/json" }
    });
  }
}

