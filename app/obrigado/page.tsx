"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarPlus, CheckCircle2, CreditCard, MapPin } from "lucide-react";
import { AddToAgenda } from "@/components/add-to-agenda";
import { WhatsAppIcon } from "@/components/whatsapp-icon";

const LOTE_1 = {
  valor: "R$ 65,00",
  link: "https://pag.ae/81GgRL1zp",
};

const LOTE_2 = {
  valor: "R$ 85,00",
  link: "https://pag.ae/81GgQBdnK",
};

function getLoteAtual(now = new Date()) {
  const fimLote1 = new Date(2026, 6, 21, 23, 59, 59, 999);
  return now <= fimLote1 ? LOTE_1 : LOTE_2;
}

function ObrigadoContent() {
  const searchParams = useSearchParams();
  const nome = searchParams.get("nome")?.trim() || "irmã";
  const loteAtual = useMemo(() => getLoteAtual(), []);

  const whatsappLink = useMemo(() => {
    const mensagem = `Olá, meu nome é ${nome} e acabei de fazer a inscrição e o pagamento para o evento Estações 2026. Segue o comprovante:`;
    return `https://wa.me/5511992171188?text=${encodeURIComponent(mensagem)}`;
  }, [nome]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-transparent px-4 py-12 text-primary sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-accent/70 bg-surface p-6 shadow-md md:p-8">
        <div className="flex items-center gap-2 text-secondary">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Inscrição confirmada</span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold md:text-3xl">Inscrição Realizada, {nome}!</h1>
        <p className="mt-2 text-sm text-primary/80 md:text-base">
          Sua vaga está pré-reservada. Para confirmar sua participação no Estações 2026, siga os
          passos abaixo:
        </p>
        <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
          Mantenha esta aba aberta até concluir o processo.
        </p>

        <div className="mt-5 rounded-2xl border border-accent/70 bg-surface p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-secondary" />
            <div>
              <p className="font-semibold">Espaço Merengue</p>
              <p className="text-sm text-primary/80">Av. Pinheirinho D&apos;Agua, 200</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <article className="rounded-2xl border border-accent/70 bg-surface p-5">
            <p className="text-sm font-semibold text-primary">Passo 1 - Pagamento</p>
            <p className="mt-1 text-sm text-primary/80">Finalize sua inscrição no ambiente seguro.</p>
            <a
              href={loteAtual.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-surface shadow-lg shadow-secondary/30 transition hover:scale-[1.02]"
            >
              <CreditCard className="h-4 w-4" />
              Pagar Inscrição (Abre em nova aba) - {loteAtual.valor}
            </a>
          </article>

          <article className="rounded-2xl border border-accent/70 bg-surface p-5">
            <p className="text-sm font-semibold text-primary">Passo 2 - WhatsApp</p>
            <p className="mt-1 text-sm text-primary/80">
              Envie o comprovante para validar sua vaga.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/30 transition hover:scale-[1.02]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Já realizei o pagamento (Confirmar no WhatsApp)
            </a>
          </article>
        </div>

        <article className="mt-4 rounded-2xl border border-accent/70 bg-surface p-5">
          <p className="text-sm font-semibold text-primary">Passo 3 - Agenda</p>
          <p className="mt-1 text-sm text-primary/80">
            Salve o evento no seu calendário com lembretes automáticos.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-primary/70">
            <CalendarPlus className="h-4 w-4" />
            Google Calendar ou arquivo .ics
          </div>
          <AddToAgenda />
        </article>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-primary/70 underline underline-offset-2 hover:text-primary">
            Voltar para o site
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-transparent px-4 py-12 text-primary sm:px-6 lg:px-8">
          <section className="mx-auto w-full max-w-2xl rounded-3xl border border-accent/70 bg-surface p-6 text-center shadow-md">
            Carregando...
          </section>
        </main>
      }
    >
      <ObrigadoContent />
    </Suspense>
  );
}
