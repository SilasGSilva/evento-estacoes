import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarDays, MapPin } from 'lucide-react';
import { AnimatedSection } from '@/components/animated-section';
import { Countdown } from '@/components/countdown';
import { Hero } from '@/components/Hero';
import { SpeakersGrid } from '@/components/speakers-grid';

export const metadata: Metadata = {
  title: 'ESTAÇÕES | AD Jardim Shangri-la',
  description:
    'Landing page oficial do evento ESTAÇÕES. Inscrições, convidadas, liderança e informações completas.',
};

const SPEAKER_BLUR_DATA_URLS = {
  elisama:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeDI9IjEiIHkxPSIwIiB5Mj0iMSI+PHN0b3Agc3RvcC1jb2xvcj0iI2I2ODQ2YSIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiNlNmQ1Y2MiIG9mZnNldD0iMTAwJSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIvPjwvc3ZnPg==",
  emily:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeDI9IjEiIHkxPSIwIiB5Mj0iMSI+PHN0b3Agc3RvcC1jb2xvcj0iIzYxN2Q5NCIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiNiNmM3ZDMiIG9mZnNldD0iMTAwJSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIvPjwvc3ZnPg==",
  cristina:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeDI9IjEiIHkxPSIwIiB5Mj0iMSI+PHN0b3Agc3RvcC1jb2xvcj0iIzQ4NGQ2ZCIgb2Zmc2V0PSIwJSIvPjxzdG9wIHN0b3AtY29sb3I9IiM5YTk3YjUiIG9mZnNldD0iMTAwJSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIvPjwvc3ZnPg==",
};

const convidados = [
  {
    nome: 'Elisama Leal',
    papel: 'Palestrante',
    imagem: '/elisama-leal.png',
    blurDataURL: SPEAKER_BLUR_DATA_URLS.elisama,
    bio: 'Missionária, teóloga, mentora, advogada, escritora e pregadora. Já viajou por diversos países anunciando o Evangelho e, hoje, ministra dentro e fora do Brasil. Fundadora do Café & Cura e da mentoria Mulheres Ungidas, carrega a missão de levantar mulheres curadas na raiz e firmadas em sua identidade como filhas de Deus.',
  },
  {
    nome: 'Emily Leal',
    papel: 'Palestrante',
    imagem: '/emily-leal.png',
    blurDataURL: SPEAKER_BLUR_DATA_URLS.emily,
    bio: 'Psicóloga, Mestra em Psicologia e MBA em Neurociências. Especialista em Terapia Cognitivo-Comportamental e docente em cursos de Medicina. Com mais de 9 anos de experiência clínica, dedica sua carreira ao estudo profundo da mente e do comportamento humano.',
  },
  {
    nome: 'Cristina Ramos',
    papel: 'Cantora',
    imagem: '/cristina-ramos.png',
    blurDataURL: SPEAKER_BLUR_DATA_URLS.cristina,
    bio: 'Cantora convidada para conduzir o louvor e ministrar com sensibilidade e excelência neste tempo especial de adoração.',
  },
];

const MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Espaço+Merengue+Av+Pinheirinho+DAgua+200';

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

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-8 pt-12 sm:px-6 lg:px-8 md:space-y-10 md:pb-12 md:pt-24">
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
          <SpeakersGrid speakers={convidados} />
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
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-5 w-5 text-secondary" />
              <div className="space-y-1">
                <p className="font-semibold text-surface">Espaço Merengue</p>
                <p>Av. Pinheirinho D&apos;Água, 200 - Jd. Panamericano</p>
                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-secondary/60 px-3 py-1 text-xs font-medium text-surface transition hover:bg-secondary/20"
                >
                  Ver no Google Maps
                </a>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Countdown />
          </div>
        </AnimatedSection>
      </div>

    </main>
  );
}
