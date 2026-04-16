"use client";

import { useState } from "react";
import Image from "next/image";

type Speaker = {
  nome: string;
  papel: string;
  imagem: string;
  bio: string;
  blurDataURL: string;
};

type SpeakersGridProps = {
  speakers: Speaker[];
};

export function SpeakersGrid({ speakers }: SpeakersGridProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  return (
    <div className="mt-6 grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {speakers.map((speaker) => {
        const imageIsLoaded = loadedImages[speaker.nome] === true;

        return (
          <article
            key={speaker.nome}
            className="flex h-full w-full max-w-sm flex-col rounded-2xl border border-accent/60 bg-surface/70 p-4 text-center shadow-sm transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-secondary shadow-lg shadow-secondary/30">
              {!imageIsLoaded && (
                <div className="absolute inset-0 animate-pulse rounded-full bg-slate-200/80" aria-hidden="true" />
              )}
              <Image
                src={speaker.imagem}
                alt={speaker.nome}
                fill
                className="object-cover object-center"
                placeholder="blur"
                blurDataURL={speaker.blurDataURL}
                onLoad={() =>
                  setLoadedImages((prev) => ({
                    ...prev,
                    [speaker.nome]: true,
                  }))
                }
              />
            </div>
            <p className="mt-4 text-lg font-semibold text-primary">{speaker.nome}</p>
            <p className="mt-1 text-sm text-primary/75">{speaker.papel}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{speaker.bio}</p>
          </article>
        );
      })}
    </div>
  );
}
