"use client";

import { useEffect } from "react";

export function PwaManifestDebug() {
  useEffect(() => {
    const checkManifest = async () => {
      try {
        const response = await fetch("/manifest.json", { cache: "no-store" });
        if (!response.ok) {
          console.info("[PWA] Manifesto nao carregado:", response.status);
          return;
        }

        console.info("[PWA] Manifesto carregado com sucesso: /manifest.json");
      } catch (error) {
        console.info("[PWA] Erro ao carregar manifesto:", error);
      }
    };

    void checkManifest();
  }, []);

  return null;
}
