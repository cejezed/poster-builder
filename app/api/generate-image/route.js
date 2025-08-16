// app/api/generate-image/route.js
import OpenAI from "openai";

export const runtime = "nodejs"; // zeker weten Node runtimes, niet edge

export async function POST(request) {
  try {
    const { prompt, width = 1024, height = 1024 } = await request.json();

    // Als er geen prompt is: fout terug
    if (!prompt || !String(prompt).trim()) {
      return Response.json({ error: "Prompt ontbreekt" }, { status: 400 });
    }

    // Als er geen API key is: graceful fallback naar picsum zodat je app wél werkt
    if (!process.env.OPENAI_API_KEY) {
      const fallback = `https://picsum.photos/${Math.max(width, 512)}/${Math.max(height, 512)}?random=${encodeURIComponent(
        prompt
      )}`;
      return Response.json({ imageUrl: fallback, provider: "fallback" }, { status: 200 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // DALL·E 3: 1024x1024 is vaste size; we kiezen de dichtstbijzijnde vierkant
    const result = await openai.images.generate({
      model: "gpt-image-1", // of "dall-e-3" als jouw account dat vereist
      prompt: `Maak een afbeelding voor een poster op basis van deze beschrijving. Schone compositie, geen tekst in beeld.\n\n${prompt}`,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const url = result?.data?.[0]?.url;
    if (!url) throw new Error("Geen image URL ontvangen van OpenAI");

    return Response.json({ imageUrl: url, provider: "openai" }, { status: 200 });
  } catch (err) {
    // Extra fallback zodat frontend netjes door kan
    const fallback = `https://picsum.photos/1024/1024?random=${Date.now()}`;
    return Response.json(
      { error: String(err?.message || err), imageUrl: fallback, provider: "fallback" },
      { status: 200 }
    );
  }
}
