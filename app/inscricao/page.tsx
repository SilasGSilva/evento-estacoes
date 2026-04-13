'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, MapPin } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { AnimatedSection } from '@/components/animated-section';
import { Hero } from '@/components/Hero';
import { WhatsAppIcon } from '@/components/whatsapp-icon';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const inscricaoSchema = z.object({
  nome: z.string().min(3, 'Informe o nome completo.'),
  whatsapp: z
    .string()
    .min(14, 'Informe um WhatsApp valido.')
    .max(15, 'Informe um WhatsApp valido.'),
  email: z.string().email('Informe um e-mail valido.'),
});

type InscricaoFormData = z.infer<typeof inscricaoSchema>;
type LoteAtual = {
  nome: string;
  valor: string;
  link: string;
};

const LOTE_1: LoteAtual = {
  nome: 'Lote 1',
  valor: 'R$ 65,00',
  link: 'https://pag.ae/81GgRL1zp',
};

const LOTE_2: LoteAtual = {
  nome: 'Lote 2',
  valor: 'R$ 85,00',
  link: 'https://pag.ae/81GgQBdnK',
};

const MAPS_LINK =
  'https://www.google.com/maps/search/?api=1&query=Espaço+Merengue+Av+Pinheirinho+DAgua+200';

const CONVIDADAS = [
  {
    nome: 'Elisama Leal',
    papel: 'Palestrante',
    imagem: '/elisama-leal.png',
    bio: 'Missionária, teóloga, mentora, advogada, escritora e pregadora. Já viajou por diversos países anunciando o Evangelho e, hoje, ministra dentro e fora do Brasil. Fundadora do Café & Cura e da mentoria Mulheres Ungidas, carrega a missão de levantar mulheres curadas na raiz e firmadas em sua identidade como filhas de Deus.',
  },
  {
    nome: 'Emily Leal',
    papel: 'Palestrante',
    imagem: '/emily-leal.png',
    bio: 'Psicóloga, Mestra em Psicologia e MBA em Neurociências. Especialista em Terapia Cognitivo-Comportamental e docente em cursos de Medicina. Com mais de 9 anos de experiência clínica, dedica sua carreira ao estudo profundo da mente e do comportamento humano.',
  },
  {
    nome: 'Cristina Ramos',
    papel: 'Cantora',
    imagem: '/cristina-ramos.png',
    bio: 'Cantora convidada para conduzir o louvor e ministrar com sensibilidade e excelência neste tempo especial de adoração.',
  },
];

function getLoteAtual(now = new Date()): LoteAtual {
  const fimLote1 = new Date(2026, 6, 21, 23, 59, 59, 999);
  const fimLote2 = new Date(2026, 7, 19, 23, 59, 59, 999);

  if (now <= fimLote1) return LOTE_1;
  if (now <= fimLote2) return LOTE_2;
  return LOTE_2;
}

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function InscricaoPage() {
  const router = useRouter();
  const [enviadoComSucesso, setEnviadoComSucesso] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [salvando, setSalvando] = useState(false);
  const loteAtual = getLoteAtual();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InscricaoFormData>({
    resolver: zodResolver(inscricaoSchema),
    defaultValues: {
      nome: '',
      whatsapp: '',
      email: '',
    },
  });

  const onSubmit = async (data: InscricaoFormData) => {
    setErroEnvio('');

    if (!isSupabaseConfigured || !supabase) {
      setErroEnvio(
        'Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para continuar.'
      );
      return;
    }

    setSalvando(true);

    const { data: inscrita, error } = await supabase
      .from('inscritos')
      .insert({
        nome: data.nome,
        whatsapp: data.whatsapp,
        email: data.email,
        status_pagamento: 'pendente',
        metodo_pagamento: null,
      })
      .select('id,nome')
      .single();

    setSalvando(false);

    if (error || !inscrita) {
      setErroEnvio('Nao foi possivel concluir sua inscricao. Tente novamente.');
      return;
    }

    setEnviadoComSucesso(true);
    router.push(`/obrigado?nome=${encodeURIComponent(data.nome)}`);
  };

  const handleIrPagamento = () => {
    window.open(loteAtual.link, '_blank', 'noopener,noreferrer');
    toast.success('Abrindo ambiente seguro de pagamento.');
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-transparent text-primary">
      <Toaster richColors position="top-center" />
      <Hero showSignUpButton={false} />

      <section className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8 md:space-y-10 md:py-24">
        <AnimatedSection className="rounded-3xl border border-accent/70 bg-surface p-6 shadow-md">
          <h2 className="text-center text-xl font-semibold text-primary">Convidadas</h2>
          <div className="mt-5 grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONVIDADAS.map((convidada) => (
              <article
                key={convidada.nome}
                className="flex h-full w-full max-w-sm flex-col rounded-2xl border border-accent/60 bg-surface/70 p-4 text-center shadow-sm transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-4 border-secondary shadow-lg shadow-secondary/30">
                  <Image
                    src={convidada.imagem}
                    alt={convidada.nome}
                    fill
                    className="object-cover object-center"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold">{convidada.nome}</p>
                <p className="text-xs text-primary/75">{convidada.papel}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{convidada.bio}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 space-y-3 rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays className="h-5 w-5 text-secondary" />
              <span>21/08/2026 - 18h</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 h-5 w-5 text-secondary" />
              <div className="space-y-1">
                <p className="font-semibold text-primary">Espaço Merengue</p>
                <p className="text-primary/80">Av. Pinheirinho D&apos;Água, 200 - Jd. Panamericano</p>
                <a
                  href={MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-secondary/60 px-3 py-1 text-xs font-medium text-primary transition hover:bg-secondary/10"
                >
                  Abrir no GPS
                </a>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {!enviadoComSucesso ? (
          <AnimatedSection
            className="rounded-3xl border border-accent/70 bg-surface p-6 shadow-md"
            delay={0.05}
          >
            <h3 className="text-lg font-semibold">Reserve o seu lugar nesse tempo de renovo</h3>
            <p className="mt-1 text-sm text-primary/80">Preencha os dados para continuar.</p>
            <div className="mt-4 rounded-2xl border border-secondary/40 bg-secondary/10 p-4 text-center">
              <p className="text-sm text-primary/80">
                {loteAtual.nome} ativo - valor atual da inscrição
              </p>
              <p className="text-2xl font-bold text-primary">{loteAtual.valor}</p>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} aria-busy={salvando}>
              <div>
                <label htmlFor="nome" className="mb-1 block text-sm font-medium text-primary">
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Digite seu nome completo"
                  className="w-full rounded-2xl border border-accent/70 px-4 py-3 text-primary outline-none transition focus:border-primary"
                  {...register('nome')}
                />
                {errors.nome && <p className="mt-1 text-sm text-primary">{errors.nome.message}</p>}
              </div>

              <div>
                <label htmlFor="whatsapp" className="mb-1 flex items-center gap-1 text-sm font-medium text-primary">
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-2xl border border-accent/70 px-4 py-3 text-primary outline-none transition focus:border-primary"
                  {...register('whatsapp', {
                    onChange: event => {
                      setValue('whatsapp', formatWhatsApp(event.target.value), {
                        shouldValidate: true,
                      });
                    },
                  })}
                />
                {errors.whatsapp && (
                  <p className="mt-1 text-sm text-primary">{errors.whatsapp.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-primary">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  className="w-full rounded-2xl border border-accent/70 px-4 py-3 text-primary outline-none transition focus:border-primary"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-primary">{errors.email.message}</p>
                )}
              </div>

              {erroEnvio && <p className="text-sm text-primary">{erroEnvio}</p>}
              {salvando && (
                <p className="text-sm text-primary/80">Estamos processando sua inscrição...</p>
              )}

              <button
                type="submit"
                disabled={salvando}
                className="w-full rounded-full bg-secondary px-5 py-3 font-semibold text-surface shadow-lg shadow-secondary/30 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvando ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface/40 border-t-surface" />
                    Enviando inscrição...
                  </span>
                ) : (
                  'Próximo'
                )}
              </button>
            </form>
          </AnimatedSection>
        ) : (
          <AnimatedSection
            className="rounded-3xl border border-accent/70 bg-surface p-6 shadow-md"
            delay={0.05}
          >
            <h3 className="text-lg font-semibold">Inscrição recebida com sucesso! 🎉</h3>
            <p className="mt-1 text-sm text-primary/80">
              Obrigada por se inscrever no ESTAÇÕES. Para concluir sua participação, siga para o
              pagamento no botão abaixo.
            </p>
            <div className="mt-4 rounded-2xl border border-secondary/40 bg-secondary/10 p-4 text-center">
              <p className="text-sm text-primary/80">Valor da inscrição</p>
              <p className="text-2xl font-bold text-primary">{loteAtual.valor}</p>
            </div>

            <button
              type="button"
              onClick={handleIrPagamento}
              className="mt-4 w-full rounded-full bg-secondary px-4 py-3 font-semibold text-surface shadow-lg shadow-secondary/30 transition hover:scale-[1.02]"
            >
              Ir para o Pagamento
            </button>
            <p className="mt-3 text-center text-sm text-primary/70">
              Ao abrir a página de pagamento, finalize o processo para garantir sua vaga no evento.
            </p>
          </AnimatedSection>
        )}
      </section>
    </main>
  );
}
