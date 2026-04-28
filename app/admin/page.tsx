"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { Banknote, Check, Download, Search, ShieldCheck, Trash2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

type Inscrito = {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  status_pagamento: string;
  metodo_pagamento: string | null;
  check_in: boolean;
  created_at: string;
};

type FiltroStatus = "TODOS" | "PAGOS" | "PENDENTES";

const METODOS_PAGAMENTO = [
  { value: "pix", label: "Pix" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "boleto", label: "Boleto" },
  { value: "dinheiro_outro", label: "Dinheiro/Outro" },
] as const;

const METODOS_PAGAMENTO_LABELS: Record<string, string> = {
  pix: "PIX",
  cartao_credito: "Cart\u00e3o de Cr\u00e9dito",
  boleto: "Boleto",
  dinheiro_outro: "Dinheiro/Outro",
};

const FIM_LOTE_1 = new Date(2026, 6, 21, 23, 59, 59, 999);
const LINK_COBRANCA_LOTE_1 = "https://pag.ae/81GgRL1zp";
const LINK_COBRANCA_LOTE_2 = "https://pag.ae/81GgQBdnK";
const MOBILE_SKELETON_ITEMS = Array.from({ length: 4 }, (_, index) => `mobile-skeleton-${index}`);
const TABLE_SKELETON_ROWS = Array.from({ length: 6 }, (_, index) => `table-skeleton-${index}`);
const FILTROS_STATUS: Array<{ value: FiltroStatus; label: string; badgeClassName: string }> = [
  { value: "TODOS", label: "Todos", badgeClassName: "bg-primary/10 text-primary" },
  { value: "PAGOS", label: "Pagos", badgeClassName: "bg-green-100 text-green-800" },
  { value: "PENDENTES", label: "Pendentes", badgeClassName: "bg-amber-100 text-amber-800" },
];

function getValorInscricao(createdAt: string) {
  const dataCadastro = new Date(createdAt);
  return dataCadastro <= FIM_LOTE_1 ? 65 : 85;
}

function getLinkCobrancaAtual() {
  const hoje = new Date();
  const dataLimite = new Date("2026-07-21T23:59:59");
  return hoje <= dataLimite ? LINK_COBRANCA_LOTE_1 : LINK_COBRANCA_LOTE_2;
}

function getAvisoLoteAtual() {
  const hoje = new Date();
  const dataLimite = new Date("2026-07-21T23:59:59");
  return hoje <= dataLimite ? "Lote atual: R$ 65 (at\u00e9 21/07)" : "Lote atual: R$ 85";
}

function getSaudacaoAtual() {
  const horaAtual = new Date().getHours();

  if (horaAtual >= 5 && horaAtual < 12) return "Bom dia";
  if (horaAtual >= 12 && horaAtual < 18) return "Boa tarde";
  return "Boa noite";
}

function getTelefoneWhatsApp(whatsapp: string) {
  const telefone = whatsapp.replace(/\D/g, "");

  if ((telefone.length === 10 || telefone.length === 11) && !telefone.startsWith("55")) {
    return `55${telefone}`;
  }

  return telefone;
}

function isPagamentoPendente(statusPagamento: string) {
  return statusPagamento.trim().toUpperCase() === "PENDENTE";
}

function isPagamentoPago(statusPagamento: string) {
  return statusPagamento.trim().toUpperCase() === "PAGO";
}

function formatMetodoPagamento(metodoPagamento: string | null) {
  if (!metodoPagamento) return "-";

  const metodoNormalizado = metodoPagamento.trim().toLowerCase();
  return (
    METODOS_PAGAMENTO_LABELS[metodoNormalizado] ??
    metodoNormalizado
      .split("_")
      .filter(Boolean)
      .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
      .join(" ")
  );
}

function formatMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDataCadastro(createdAt: string) {
  return new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusPagamentoLabel(statusPagamento: string) {
  return isPagamentoPago(statusPagamento) ? "Confirmado" : "Pendente";
}

function getStatusPagamentoClassName(statusPagamento: string) {
  return isPagamentoPago(statusPagamento) ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800";
}

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("TODOS");
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState("");
  const [confirmacaoPagamento, setConfirmacaoPagamento] = useState<{
    id: string;
    nome: string;
  } | null>(null);
  const [metodoPagamentoSelecionado, setMetodoPagamentoSelecionado] = useState<
    (typeof METODOS_PAGAMENTO)[number]["value"]
  >(METODOS_PAGAMENTO[0].value);

  const carregarInscritos = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setGlobalError(
        "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para acessar o painel.",
      );
      return;
    }

    setGlobalError("");
    setLoading(true);

    const { data, error } = await supabase
      .from("inscritos")
      .select("id,nome,whatsapp,email,status_pagamento,metodo_pagamento,check_in,created_at")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setGlobalError("Não foi possível carregar as inscritas.");
      return;
    }

    setInscritos((data ?? []) as Inscrito[]);
  };

  const inscritosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return inscritos.filter((inscrito) => {
      const correspondeBusca =
        !termo ||
        inscrito.nome.toLowerCase().includes(termo) ||
        inscrito.whatsapp.toLowerCase().includes(termo);
      const correspondeStatus =
        filtroStatus === "TODOS" ||
        (filtroStatus === "PAGOS" && isPagamentoPago(inscrito.status_pagamento)) ||
        (filtroStatus === "PENDENTES" && isPagamentoPendente(inscrito.status_pagamento));

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, inscritos]);

  const totalInscritos = inscritos.length;
  const totalPagos = inscritos.filter((item) => isPagamentoPago(item.status_pagamento)).length;
  const totalPendentes = inscritos.filter((item) => isPagamentoPendente(item.status_pagamento)).length;
  const totalArrecadadoConfirmado = inscritos
    .filter((item) => isPagamentoPago(item.status_pagamento))
    .reduce((acc, inscrita) => acc + getValorInscricao(inscrita.created_at), 0);
  const avisoLoteAtual = getAvisoLoteAtual();
  const totaisPorFiltro: Record<FiltroStatus, number> = {
    TODOS: totalInscritos,
    PAGOS: totalPagos,
    PENDENTES: totalPendentes,
  };

  const autenticar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    setAuthLoading(true);

    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: passwordInput,
      }),
    });

    setAuthLoading(false);

    if (!response.ok) {
      setAuthError("Não foi possível validar a senha.");
      return;
    }

    const body = (await response.json()) as { ok: boolean; message?: string };

    if (!body.ok) {
      setAuthError(body.message ?? "Senha inválida.");
      return;
    }

    setIsAuthenticated(true);
    void carregarInscritos();
  };

  const atualizarInscrito = async (id: string, payload: Partial<Inscrito>) => {
    if (!supabase) return;

    setActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase.from("inscritos").update(payload).eq("id", id);

    setActionLoadingId(null);

    if (error) {
      setGlobalError("Não foi possível atualizar a inscrita.");
      toast.error("Não foi possível atualizar a inscrita.");
      return;
    }

    toast.success("Registro atualizado com sucesso.");
    await carregarInscritos();
  };

  const abrirConfirmacaoPagamento = (id: string, nome: string) => {
    setConfirmacaoPagamento({ id, nome });
    setMetodoPagamentoSelecionado(METODOS_PAGAMENTO[0].value);
  };

  const abrirCobrancaWhatsApp = (whatsapp: string) => {
    const telefone = getTelefoneWhatsApp(whatsapp);

    if (!telefone) {
      toast.error("WhatsApp invalido para envio da cobranca.");
      return;
    }

    const linkDoLote = getLinkCobrancaAtual();
    const saudacao = getSaudacaoAtual();
    const mensagem = `Ol\u00e1, paz do Senhor! ${saudacao}, tudo bem? Notamos que sua inscri\u00e7\u00e3o para o Caf\u00e9 & Cura 2026 ainda est\u00e1 aguardando o pagamento. Garanta sua vaga no lote atual atrav\u00e9s deste link: ${linkDoLote}. Assim que concluir, voc\u00ea receber\u00e1 a confirma\u00e7\u00e3o. Se j\u00e1 realizou o pagamento, por favor, nos envie o comprovante por aqui!`;
    const whatsappUrl = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const confirmarPagamentoManual = async () => {
    if (!supabase || !confirmacaoPagamento) return;

    const { id } = confirmacaoPagamento;
    const payloadBase = {
      status_pagamento: "pago",
      metodo_pagamento: metodoPagamentoSelecionado,
    };

    setActionLoadingId(id);
    setGlobalError("");

    let error = (
      await supabase
        .from("inscritos")
        .update({
          ...payloadBase,
          data_pagamento: new Date().toISOString(),
        } as never)
        .eq("id", id)
    ).error;

    const colunaDataPagamentoInexistente =
      error &&
      (error.code === "42703" ||
        error.message.toLowerCase().includes("data_pagamento") ||
        error.message.toLowerCase().includes("column"));

    if (colunaDataPagamentoInexistente) {
      error = (await supabase.from("inscritos").update(payloadBase).eq("id", id)).error;
    }

    setActionLoadingId(null);

    if (error) {
      setGlobalError("Não foi possível confirmar o pagamento.");
      toast.error(error.message || "Não foi possível confirmar o pagamento.");
      return;
    }

    toast.success("Pagamento confirmado com sucesso.");
    setConfirmacaoPagamento(null);
    setMetodoPagamentoSelecionado(METODOS_PAGAMENTO[0].value);
    await carregarInscritos();
  };

  const excluirInscrita = async (id: string, nome: string) => {
    if (!supabase) return;

    if (typeof id !== "string") {
      toast.error("ID inválido para exclusão.");
      return;
    }

    const confirmar = window.confirm(
      `Deseja excluir a inscrita "${nome}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmar) return;

    setActionLoadingId(id);
    setGlobalError("");

    const { error } = await supabase.from("inscritos").delete().eq("id", id);

    setActionLoadingId(null);

    if (error) {
      setGlobalError("Não foi possível excluir a inscrita.");
      toast.error(error.message || "Não foi possível excluir a inscrita.");
      return;
    }

    setInscritos((prev) => prev.filter((item) => item.id !== id));
    toast.success("Inscrita excluida com sucesso.");
  };

  const exportarCsv = () => {
    const header = [
      "Nome",
      "WhatsApp",
      "Email",
      "Status Pagamento",
      "Método de Pagamento",
      "Check-in",
      "Data Cadastro",
    ];

    const rows = inscritosFiltrados.map((inscrita) => [
      inscrita.nome,
      inscrita.whatsapp,
      inscrita.email,
      inscrita.status_pagamento,
      formatMetodoPagamento(inscrita.metodo_pagamento),
      inscrita.check_in ? "Sim" : "Não",
      new Date(inscrita.created_at).toLocaleString("pt-BR"),
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inscritas-ESTAÇÕES.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen max-w-full overflow-x-hidden bg-transparent px-4 py-12 text-primary md:px-8 md:py-20">
        <Toaster richColors position="top-center" />
        <section className="mx-auto w-full max-w-md rounded-2xl border border-accent/70 bg-surface p-6 shadow-md">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo.png"
              alt="Logo AD Jardim Shangri-la"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border border-accent/60 bg-surface p-1"
              priority
            />
          </div>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-secondary" />
            <h1 className="text-xl font-semibold">Acesso Administrativo</h1>
          </div>

          <form className="space-y-4" onSubmit={autenticar}>
            <div>
              <label htmlFor="admin-password" className="mb-1 block text-sm font-medium">
                Senha
              </label>
              <input
                id="admin-password"
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="w-full rounded-xl border border-accent/70 px-4 py-3 outline-none transition focus:border-primary"
                placeholder="Digite a senha de acesso"
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-full bg-secondary px-4 py-3 font-semibold text-surface shadow-lg shadow-secondary/30 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {authLoading ? "Validando..." : "Entrar"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-full overflow-x-hidden bg-transparent px-4 py-12 text-primary md:px-8 md:py-20">
      <Toaster richColors position="top-center" />
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
          <div className="mb-3 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo AD Jardim Shangri-la"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-accent/60 bg-surface p-1"
            />
            <span className="text-sm font-medium text-primary/80">AD Jardim Shangri-la</span>
          </div>
          <h1 className="text-2xl font-semibold">Admin - ESTAÇÕES</h1>
          <p className="mt-1 text-sm text-primary/80">
            Gerencie inscritas, pagamentos e check-in no dia do evento.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
            <p className="text-sm text-primary/70">Total de Inscritas</p>
            <p className="mt-1 text-2xl font-bold">{totalInscritos}</p>
          </article>
          <article className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
            <p className="text-sm text-primary/70">Pagamentos Confirmados</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{totalPagos}</p>
          </article>
          <article className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
            <p className="text-sm text-primary/70">Total Confirmado</p>
            <p className="mt-1 text-2xl font-bold text-secondary">
              {totalArrecadadoConfirmado.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
            <p className="mt-1 text-xs text-primary/70">{totalPagos} pessoas pagas</p>
          </article>
        </section>

        <section className="rounded-2xl border border-accent/70 bg-secondary/10 p-3 text-sm text-primary/80 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Pendentes no momento: <strong>{totalPendentes}</strong>
            </span>
            <span className="inline-flex w-fit rounded-full border border-secondary/30 bg-surface px-3 py-1 text-xs font-semibold text-secondary">
              {avisoLoteAtual}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
              <input
                type="text"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome ou WhatsApp"
                className="w-full rounded-xl border border-accent/70 py-2.5 pl-9 pr-3 outline-none transition focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={exportarCsv}
              className="flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-surface shadow-lg shadow-secondary/30 transition hover:scale-[1.02]"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div
              className="grid grid-cols-3 gap-2 overflow-x-auto pb-1 md:flex md:justify-start"
              role="tablist"
              aria-label="Filtrar inscritas por status"
            >
              {FILTROS_STATUS.map((filtro) => {
                const filtroAtivo = filtroStatus === filtro.value;

                return (
                  <button
                    key={filtro.value}
                    type="button"
                    role="tab"
                    aria-selected={filtroAtivo}
                    onClick={() => setFiltroStatus(filtro.value)}
                    className={`inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm font-semibold transition sm:gap-2 sm:px-3 ${
                      filtroAtivo
                        ? "border-secondary bg-secondary text-surface shadow-md shadow-secondary/20"
                        : "border-gray-200 bg-gray-50 text-primary hover:border-secondary/60 hover:bg-gray-100"
                    }`}
                  >
                    <span className="truncate">{filtro.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${filtro.badgeClassName}`}>
                      {totaisPorFiltro[filtro.value]}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-sm font-medium text-primary/70 md:text-right">
              Exibindo <strong>{inscritosFiltrados.length}</strong> de <strong>{totalInscritos}</strong>
            </span>
          </div>
        </section>

        {globalError && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {globalError}
          </section>
        )}

        {loading ? (
          <>
            <section className="space-y-3 md:hidden">
              {MOBILE_SKELETON_ITEMS.map((itemId) => (
                <article
                  key={itemId}
                  className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md"
                  aria-hidden="true"
                >
                  <div className="h-5 w-2/3 animate-pulse rounded bg-primary/10" />
                  <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-primary/10" />
                  <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-primary/10" />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-primary/10" />
                    <div className="h-6 w-28 animate-pulse rounded-full bg-primary/10" />
                    <div className="h-6 w-24 animate-pulse rounded-full bg-primary/10" />
                  </div>

                  <div className="mt-3 grid gap-2">
                    <div className="h-10 w-full animate-pulse rounded-xl bg-primary/10" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-primary/10" />
                    <div className="h-10 w-full animate-pulse rounded-xl bg-primary/10" />
                  </div>
                </article>
              ))}
            </section>

            <section className="hidden min-h-[360px] max-w-full bg-surface md:block">
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-primary/5">
                  <tr>
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3 font-semibold">Nome</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">WhatsApp</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Email</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Pagamento</th>
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3 font-semibold">Método</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Check-in</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLE_SKELETON_ROWS.map((rowId) => (
                    <tr key={rowId} className="border-t border-primary/10" aria-hidden="true">
                      <td className="min-w-[150px] whitespace-nowrap px-4 py-3">
                        <div className="h-4 w-40 animate-pulse rounded bg-primary/10" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="h-4 w-28 animate-pulse rounded bg-primary/10" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="h-4 w-52 animate-pulse rounded bg-primary/10" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="h-6 w-24 animate-pulse rounded-full bg-primary/10" />
                      </td>
                      <td className="min-w-[150px] whitespace-nowrap px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-primary/10" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="h-4 w-10 animate-pulse rounded bg-primary/10" />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex gap-2">
                          <div className="h-7 w-20 animate-pulse rounded-lg bg-primary/10" />
                          <div className="h-7 w-16 animate-pulse rounded-lg bg-primary/10" />
                          <div className="h-7 w-10 animate-pulse rounded-lg bg-primary/10" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-4 md:hidden">
              {inscritosFiltrados.length === 0 ? (
                <article className="rounded-2xl border border-accent/70 bg-surface p-4 text-sm text-primary/70 shadow-md">
                  Nenhuma inscrita encontrada.
                </article>
              ) : (
                inscritosFiltrados.map((inscrito) => (
                  <article key={inscrito.id} className="rounded-xl border border-accent/70 bg-surface p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{inscrito.nome}</p>
                        <p className="mt-1 text-sm text-primary/70">{inscrito.whatsapp}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusPagamentoClassName(
                          inscrito.status_pagamento,
                        )}`}
                      >
                        {getStatusPagamentoLabel(inscrito.status_pagamento)}
                      </span>
                    </div>
                    <div className="hidden">
                      <span className="rounded-full bg-primary/10 px-2 py-1">
                        {inscrito.status_pagamento}
                      </span>
                      <span className="rounded-full bg-secondary/20 px-2 py-1">
                        {formatMetodoPagamento(inscrito.metodo_pagamento) === "-"
                          ? "sem método"
                          : formatMetodoPagamento(inscrito.metodo_pagamento)}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-1">
                        Check-in: {inscrito.check_in ? "sim" : "não"}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-medium text-primary/55">M&eacute;todo</p>
                        <p className="mt-1 font-medium">{formatMetodoPagamento(inscrito.metodo_pagamento)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-primary/55">Valor</p>
                        <p className="mt-1 font-medium">{formatMoeda(getValorInscricao(inscrito.created_at))}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-primary/55">Data</p>
                        <p className="mt-1 font-medium">{formatDataCadastro(inscrito.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-primary/55">Check-in</p>
                        <p className="mt-1 font-medium">{inscrito.check_in ? "Sim" : "N\u00e3o"}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      {isPagamentoPendente(inscrito.status_pagamento) && (
                        <button
                          type="button"
                          aria-label={`Cobrar ${inscrito.nome} no WhatsApp`}
                          onClick={() => abrirCobrancaWhatsApp(inscrito.whatsapp)}
                          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#25D366]/40 bg-[#25D366]/15 text-[#25D366] transition hover:bg-[#25D366]/25"
                        >
                          <WhatsAppIcon className="h-7 w-7" />
                        </button>
                      )}
                      {!isPagamentoPago(inscrito.status_pagamento) && (
                        <button
                          type="button"
                          aria-label={`Confirmar pagamento de ${inscrito.nome}`}
                          disabled={actionLoadingId === inscrito.id}
                          onClick={() => abrirConfirmacaoPagamento(inscrito.id, inscrito.nome)}
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-green-300 bg-green-50 text-green-800 transition hover:bg-green-100 disabled:opacity-60"
                        >
                          <Banknote className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={`Confirmar check-in de ${inscrito.nome}`}
                        disabled={actionLoadingId === inscrito.id || inscrito.check_in}
                        onClick={() =>
                          void atualizarInscrito(inscrito.id, {
                            check_in: true,
                          })
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/70 bg-surface text-primary transition hover:border-primary disabled:opacity-60"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Excluir ${inscrito.nome}`}
                        disabled={actionLoadingId === inscrito.id}
                        onClick={() => void excluirInscrita(inscrito.id, inscrito.nome)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-300 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>

            <section className="hidden max-w-full bg-surface md:block">
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-primary/5">
                  <tr>
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3 font-semibold">Nome</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">WhatsApp</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Email</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Pagamento</th>
                    <th className="min-w-[150px] whitespace-nowrap px-4 py-3 font-semibold">Método</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Check-in</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inscritosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="whitespace-nowrap px-4 py-4 text-center text-primary/70">
                        Nenhuma inscrita encontrada.
                      </td>
                    </tr>
                  ) : (
                    inscritosFiltrados.map((inscrito) => (
                      <tr key={inscrito.id} className="border-t border-primary/10">
                        <td className="min-w-[150px] whitespace-nowrap px-4 py-3">{inscrito.nome}</td>
                        <td className="whitespace-nowrap px-4 py-3">{inscrito.whatsapp}</td>
                        <td className="whitespace-nowrap px-4 py-3">{inscrito.email}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusPagamentoClassName(
                              inscrito.status_pagamento,
                            )}`}
                          >
                            {getStatusPagamentoLabel(inscrito.status_pagamento)}
                          </span>
                        </td>
                        <td className="min-w-[150px] whitespace-nowrap px-4 py-3">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary/80">
                            {formatMetodoPagamento(inscrito.metodo_pagamento)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{inscrito.check_in ? "Sim" : "Não"}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex gap-2">
                            {isPagamentoPendente(inscrito.status_pagamento) && (
                              <button
                                type="button"
                                aria-label={`Cobrar ${inscrito.nome} no WhatsApp`}
                                title="Cobrar no WhatsApp"
                                onClick={() => abrirCobrancaWhatsApp(inscrito.whatsapp)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] transition hover:bg-[#25D366]/20"
                              >
                                <WhatsAppIcon className="h-4 w-4" />
                              </button>
                            )}
                            {!isPagamentoPago(inscrito.status_pagamento) && (
                              <button
                                type="button"
                                aria-label={`Confirmar pagamento de ${inscrito.nome}`}
                                title="Confirmar pagamento"
                                disabled={actionLoadingId === inscrito.id}
                                onClick={() => abrirConfirmacaoPagamento(inscrito.id, inscrito.nome)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-300 bg-green-50 text-green-800 transition hover:bg-green-100 disabled:opacity-60"
                              >
                                <Banknote className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              aria-label={`Confirmar check-in de ${inscrito.nome}`}
                              title="Confirmar check-in"
                              disabled={actionLoadingId === inscrito.id || inscrito.check_in}
                              onClick={() =>
                                void atualizarInscrito(inscrito.id, {
                                  check_in: true,
                                })
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/70 bg-surface text-primary transition hover:border-primary disabled:opacity-60"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Excluir ${inscrito.nome}`}
                              title="Excluir"
                              disabled={actionLoadingId === inscrito.id}
                              onClick={() => void excluirInscrita(inscrito.id, inscrito.nome)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-300 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </section>

      {confirmacaoPagamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-accent/70 bg-surface p-5 shadow-xl">
            <h2 className="text-lg font-semibold">Confirmar pagamento de {confirmacaoPagamento.nome}?</h2>
            <p className="mt-1 text-sm text-primary/75">
              Selecione o método de pagamento para concluir a confirmação manual.
            </p>

            <div className="mt-4">
              <label htmlFor="metodo-pagamento" className="mb-1 block text-sm font-medium text-primary">
                Método de pagamento
              </label>
              <select
                id="metodo-pagamento"
                value={metodoPagamentoSelecionado}
                onChange={(event) =>
                  setMetodoPagamentoSelecionado(event.target.value as (typeof METODOS_PAGAMENTO)[number]["value"])
                }
                className="w-full rounded-xl border border-accent/70 bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-primary"
              >
                {METODOS_PAGAMENTO.map((metodo) => (
                  <option key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmacaoPagamento(null)}
                className="rounded-lg border border-accent/70 bg-surface px-4 py-2 text-sm font-medium transition hover:border-primary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmarPagamentoManual()}
                disabled={actionLoadingId === confirmacaoPagamento.id}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-surface shadow-lg shadow-secondary/30 transition hover:scale-[1.02] disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {actionLoadingId === confirmacaoPagamento.id ? "Confirmando..." : "Confirmar pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
