export const metadata = {
  title: 'AI Poster – demo',
  description: 'Generate AI images via OpenAI API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>
        {children}
        <style jsx global>{`
          html, body { margin: 0; padding: 0; background: #f6f7f9; color: #111; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
          .container { max-width: 1200px; margin: 28px auto; padding: 0 16px; }
          .grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 16px; }
          .card { background: #fff; border: 1px solid #eaeaea; border-radius: 14px; padding: 16px; }
          .btn { background: #111; color: #fff; padding: 10px 14px; border-radius: 10px; border: 0; cursor: pointer; }
          .btn[disabled] { background: #ccc; cursor: not-allowed; }
          .field { display: grid; gap: 6px; }
          .input, .select, .textarea { padding: 10px; border-radius: 10px; border: 1px solid #ddd; }
          .row { display: flex; gap: 12px; align-items: center; }
          .space { height: 8px; }
          .price { margin-left: auto; font-weight: 700; }

          /* Preview frame */
          .previewBox { position: relative; width: 100%; aspect-ratio: 4 / 3; border: 1px solid #ddd; border-radius: 14px; overflow: hidden; background: #fafafa; display: grid; place-items: center; }
          .previewImg { width: 100%; height: 100%; object-fit: cover; }
          .overlayText { position: absolute; left: 0; right: 0; bottom: 16px; text-align: center; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.15); padding: 0 12px; pointer-events: none; }

          /* Responsive */
          @media (max-width: 980px) {
            .grid { grid-template-columns: 1fr; }
            .price { margin-left: 0; }
          }
        `}</style>
      </body>
    </html>
  );
