// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "PosterBuilder",
  description: "Maak je eigen gepersonaliseerde poster",
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
