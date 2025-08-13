export const runtime = "nodejs";

import { readdir } from "fs/promises";
import path from "path";

const ALLOWED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export async function GET() {
  try {
    // /public/examples binnen je project (read-only op Vercel)
    const dir = path.join(process.cwd(), "public", "examples");
    const files = await readdir(dir).catch(() => []);

    const list = files
      .filter((name) => ALLOWED.has(path.extname(name).toLowerCase()))
      .map((name) => `/examples/${name}`);

    return new Response(JSON.stringify({ files: list }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ files: [], error: "Failed to read examples" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
