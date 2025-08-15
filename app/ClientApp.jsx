"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function ClientApp() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <TopBar />
      <Hero />
      <Builder />
      <BottomBar />
    </div>
  );
}

// Hieronder definieer je de componenten die je in ClientApp gebruikt
function TopBar() {
  // ... (de code voor TopBar)
}

function Hero() {
  // ... (de code voor Hero)
}

// ... (de rest van je code, inclusief de Builder component en alle andere helperfuncties)

// VOEG DEZE CODE TOE
function BottomBar() {
  return (
    <footer className="border-t bg-neutral-100 py-6 text-sm text-neutral-600">
      <div className="mx-auto max-w-6xl px-4 text-center">
        © {new Date().getFullYear()} – PosterBuilder
      </div>
    </footer>
  );
}
