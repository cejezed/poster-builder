export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    return new Response(JSON.stringify({ ok: true, orderId, received: body }), {
      headers: { "content-type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
}
