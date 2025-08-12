export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Hier kun je validatie toevoegen; voor demo doen we simpel
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // In productie: sla order + configuratie + image-URL op in een database
    return new Response(
      JSON.stringify({ ok: true, orderId, received: body }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid JSON" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }
}
