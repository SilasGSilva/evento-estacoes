'use client';

import Image from 'next/image';
import { AnimatedSection } from '@/components/animated-section';
import { PulseCtaLink } from '@/components/pulse-cta-link';

type HeroProps = {
  showSignUpButton?: boolean;
};

export function Hero({ showSignUpButton = false }: HeroProps) {
  return (
    <AnimatedSection className="relative w-full overflow-hidden">
      <div className="hero-content-wrapper relative h-[290px] w-full overflow-hidden md:h-[620px]">
        <Image
          src="/hero-banner.png"
          alt="Estações 2026 - Gênesis 8:22"
          width={1920}
          height={1080}
          sizes="100vw"
          quality={100}
          className="block h-full w-full object-cover object-top"
          priority
        />
        {showSignUpButton && (
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center px-3">
            <PulseCtaLink
              href="/inscricao"
              label="INSCREVA-SE PARA O EVENTO"
              className="inline-flex rounded-full bg-secondary px-6 py-2.5 text-xs font-semibold tracking-wide text-surface shadow-2xl shadow-black/55 ring-1 ring-surface/35 transition hover:bg-secondary/90 sm:px-7 sm:py-3 sm:text-sm"
            />
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}
