import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarDays, MapPin } from 'lucide-react';
import { AnimatedSection } from '@/components/animated-section';
import { Countdown } from '@/components/countdown';
import { Hero } from '@/components/Hero';

export const metadata: Metadata = {
  title: 'ESTAÇÕES | AD Jardim Shangri-la',
  description:
    'Landing page oficial do evento ESTAÇÕES. Inscrições, convidadas, liderança e informações completas.',
};

const convidados = [
  { nome: 'Elisama Leal', papel: 'Palestrante', imagem: '/elisama-leal.png' },
  { nome: 'Cristina Ramos', papel: 'Cantora', imagem: '/cristina-ramos.png' },
];

const MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Av.%20Pinheirinho%20D%27Agua%2C%20200%20-%20Jd.%20Panamericano';

const lideranca = [
  {
    nome: 'Pr. Jose Wellignton Bezerra da Costa',
    papel: 'Presidente',
    imagem: '/pastor-presidente.png',
  },
  { nome: 'Pr. Hermes Barreto', papel: 'Setorial', imagem: '/pastor-setorial.png' },
  { nome: 'Pr. Josivaldo Costa', papel: 'Local - Jardim Shangri-la', imagem: '/pastor-local.png' },
];

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden bg-transparent text-primary">
      <Hero showSignUpButton={true} />

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8 md:space-y-10 md:py-24">
        <AnimatedSection className="rounded-3xl border border-accent/70 bg-surface p-6 shadow-md md:p-8">
          <h2 className="text-2xl font-semibold text-primary md:text-3xl">Sobre o Tema</h2>
          <p className="mt-4 rounded-xl border-l-4 border-secondary bg-secondary/10 p-4 leading-relaxed text-primary/90 shadow-sm">
            Em cada estação, Deus sustenta a vida, cura a alma e faz florescer um novo tempo.
          </p>
        </AnimatedSection>

        <AnimatedSection
          className="rounded-3xl border border-accent/70 bg-surface p-6 shadow-md md:p-8"
          delay={0.05}
        >
          <h2 className="text-2xl font-semibold md:text-3xl">Convidadas</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {convidados.map(convidado => (
              <article key={convidado.nome} className="text-center">
                <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-secondary shadow-lg shadow-secondary/30">
                  <Image
                    src={convidado.imagem}
                    alt={convidado.nome}
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <p className="mt-4 text-lg font-semibold text-primary">{convidado.nome}</p>
                <p className="mt-1 text-sm text-primary/75">{convidado.papel}</p>
              </article>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection
          className="rounded-3xl border border-accent/70 bg-surface p-6 shadow-md md:p-8"
          delay={0.1}
        >
          <h2 className="text-2xl font-semibold md:text-3xl">Nossa Liderança</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lideranca.map(lider => (
              <article key={lider.nome} className="text-center">
                <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-secondary shadow-lg shadow-secondary/30">
                  <Image src={lider.imagem} alt={lider.nome} fill className="object-cover object-center" />
                </div>
                <p className="mt-4 text-base font-semibold">{lider.nome}</p>
                <p className="text-sm text-primary/75">{lider.papel}</p>
              </article>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection
          className="rounded-3xl bg-gradient-to-br from-primary to-secondary/70 p-6 shadow-xl md:p-8"
          delay={0.15}
        >
          <h2 className="text-2xl font-semibold text-surface md:text-3xl">
            Informações Logísticas
          </h2>
          <div className="mt-5 grid gap-3 text-white/90">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-secondary" />
              <span>21/08/2026 - 18h</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-secondary" />
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-secondary/70 underline-offset-2 hover:text-surface"
              >
                Av. Pinheirinho D&apos;Agua, 200 - Jd. Panamericano
              </a>
            </p>
          </div>
          <div className="mt-6">
            <Countdown />
          </div>
        </AnimatedSection>
      </div>

      <footer className="border-t border-accent/70 bg-surface px-4 py-6 text-center text-sm text-primary/80">
        <div className="flex flex-col items-center justify-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo AD Jardim Shangri-la"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
          />
          <span>Organização: AD Jardim Shangri-la</span>
        </div>
      </footer>
    </main>
  );
}
