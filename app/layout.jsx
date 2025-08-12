export const metadata = {
  title: 'AI Poster – demo',
  description: 'Generate AI images via OpenAI API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body style={{ margin: 0, padding: 0, background: '#f7f7f8' }}>{children}</body>
    </html>
  );
}
