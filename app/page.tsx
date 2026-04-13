import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarDays, MapPin } from 'lucide-react';
import { AnimatedSection } from '@/components/animated-section';
import { Countdown } from '@/components/countdown';
import { PulseCtaLink } from '@/components/pulse-cta-link';

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
    <main className="relative bg-transparent text-primary">
      <AnimatedSection className="relative overflow-hidden bg-gradient-to-b from-primary to-secondary/70 px-4 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-[-20%] top-[-10%] h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-15%] h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/logo.png"
              alt="Logo AD Jardim Shangri-la"
              width={52}
              height={52}
              className="h-[52px] w-[52px] rounded-full border border-accent/60 bg-surface/95 p-1"
              priority
            />
          </div>
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-white/75">
            Evento AD Belém - Jardim Shangri-la
          </p>
          <h1 className="text-6xl font-semibold tracking-[0.18em] text-surface md:text-7xl">
            ESTAÇÕES
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-sm leading-relaxed text-white/90 md:text-base">
            Enquanto a terra durar, sementeira e sega, e frio e calor, e verão e inverno, e dia e
            noite, não cessarão. (Gênesis 8:22)
          </p>

          <div className="mt-9">
            <PulseCtaLink
              href="/inscricao"
              label="INSCREVA-SE PARA O EVENTO"
              className="inline-flex rounded-full bg-secondary px-7 py-3 text-sm font-semibold tracking-wide text-surface transition hover:bg-secondary/90"
            />
          </div>
        </div>
      </AnimatedSection>

      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
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
          <div className="mt-6 grid gap-4 md:grid-cols-2">
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
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
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
