import OpenAI from "openai";

export async function POST(req) {
  try {
    const { prompt, size } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'prompt'" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const resp = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: size || "1024x1024",
      // We ask for base64 so we can display directly without hosting the image elsewhere
      response_format: "b64_json",
    });

    const b64 = resp.data?.[0]?.b64_json;
    if (!b64) {
      return new Response(
        JSON.stringify({ error: "No image returned" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${b64}` }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    console.error("/api/generate error", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
