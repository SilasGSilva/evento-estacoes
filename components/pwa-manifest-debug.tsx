"use client";

import { useEffect } from "react";

export function PwaManifestDebug() {
  useEffect(() => {
    const checkManifest = async () => {
      try {
        await fetch("/manifest.json", { cache: "no-store" });
      } catch {
        // Ignora erro em ambiente de desenvolvimento.
      }
    };

    void checkManifest();
  }, []);

  return null;
}
