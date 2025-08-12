export const metadata = {
  title: 'AI Poster – demo',
  description: 'Generate AI images via OpenAI API',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
