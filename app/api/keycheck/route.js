export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10;
  return new Response(JSON.stringify({ hasKey }), {
    headers: { "content-type": "application/json" },
  });
}
