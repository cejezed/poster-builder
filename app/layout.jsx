import "./globals.css";

export const metadata = {
  title: "AI Poster – demo",
  description: "Generate AI images via OpenAI API",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
