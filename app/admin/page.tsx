"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { Download, Search, ShieldCheck, Trash2 } from "lucide-react";
import { Toaster, toast } from "sonner";
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

const FIM_LOTE_1 = new Date(2026, 6, 21, 23, 59, 59, 999);

function getValorInscricao(createdAt: string) {
  const dataCadastro = new Date(createdAt);
  return dataCadastro <= FIM_LOTE_1 ? 65 : 85;
}

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [busca, setBusca] = useState("");
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState("");

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
      setGlobalError("Nao foi possivel carregar as inscritas.");
      return;
    }

    setInscritos((data ?? []) as Inscrito[]);
  };

  const inscritosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return inscritos;

    return inscritos.filter((inscrito) => {
      const nomeMatch = inscrito.nome.toLowerCase().includes(termo);
      const whatsappMatch = inscrito.whatsapp.toLowerCase().includes(termo);
      return nomeMatch || whatsappMatch;
    });
  }, [busca, inscritos]);

  const totalInscritos = inscritos.length;
  const totalPagos = inscritos.filter((item) => item.status_pagamento === "pago").length;
  const totalPendentes = inscritos.filter((item) => item.status_pagamento !== "pago").length;
  const expectativaArrecadacao = inscritos
    .filter((item) => item.status_pagamento === "pago")
    .reduce((acc, inscrita) => acc + getValorInscricao(inscrita.created_at), 0);

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
      setAuthError("Nao foi possivel validar a senha.");
      return;
    }

    const body = (await response.json()) as { ok: boolean; message?: string };

    if (!body.ok) {
      setAuthError(body.message ?? "Senha invalida.");
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
      setGlobalError("Nao foi possivel atualizar a inscrita.");
      toast.error("Nao foi possivel atualizar a inscrita.");
      return;
    }

    toast.success("Registro atualizado com sucesso.");
    await carregarInscritos();
  };

  const atualizarStatusPagamento = async (id: string, statusAtual: string) => {
    await atualizarInscrito(id, {
      status_pagamento: statusAtual === "pago" ? "pendente" : "pago",
    });
  };

  const excluirInscrita = async (id: string, nome: string) => {
    if (!supabase) return;

    if (typeof id !== "string") {
      toast.error("ID invalido para exclusao.");
      return;
    }

    const confirmar = window.confirm(`Deseja excluir a inscrita "${nome}"? Esta acao nao pode ser desfeita.`);
    if (!confirmar) return;

    setActionLoadingId(id);
    setGlobalError("");

    // Se a operacao falhar com "403 Forbidden" ou "Policy Violation",
    // revise as politicas RLS no Supabase para DELETE na tabela inscritos.
    // SQL sugerido:
    // ALTER TABLE inscritos ENABLE ROW LEVEL SECURITY;
    // ...e crie policy especifica para DELETE do papel usado no app.
    const { error } = await supabase.from("inscritos").delete().eq("id", id);
    console.log("Erro ao deletar:", error);

    setActionLoadingId(null);

    if (error) {
      setGlobalError("Nao foi possivel excluir a inscrita.");
      toast.error(error.message || "Nao foi possivel excluir a inscrita.");
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
      "Metodo Pagamento",
      "Check-in",
      "Data Cadastro",
    ];

    const rows = inscritosFiltrados.map((inscrita) => [
      inscrita.nome,
      inscrita.whatsapp,
      inscrita.email,
      inscrita.status_pagamento,
      inscrita.metodo_pagamento ?? "",
      inscrita.check_in ? "Sim" : "Nao",
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
      <main className="min-h-screen bg-transparent px-4 py-10 text-primary">
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
    <main className="min-h-screen bg-transparent px-4 py-6 text-primary">
      <Toaster richColors position="top-center" />
      <section className="mx-auto w-full max-w-6xl space-y-4">
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

        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
            <p className="text-sm text-primary/70">Total de Inscritas</p>
            <p className="mt-1 text-2xl font-bold">{totalInscritos}</p>
          </article>
          <article className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
            <p className="text-sm text-primary/70">Pagamentos Confirmados</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{totalPagos}</p>
          </article>
          <article className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
            <p className="text-sm text-primary/70">Expectativa de Arrecadacao</p>
            <p className="mt-1 text-2xl font-bold text-secondary">
              {expectativaArrecadacao.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </article>
        </section>

        <section className="rounded-2xl border border-accent/70 bg-secondary/10 p-3 text-sm text-primary/80 shadow-sm">
          Pendentes no momento: <strong>{totalPendentes}</strong>
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
        </section>

        {globalError && (
          <section className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {globalError}
          </section>
        )}

        {loading ? (
          <section className="rounded-2xl border border-accent/70 bg-surface p-6 text-center shadow-md">
            Carregando inscritas...
          </section>
        ) : (
          <>
            <section className="space-y-3 md:hidden">
              {inscritosFiltrados.length === 0 ? (
                <article className="rounded-2xl border border-accent/70 bg-surface p-4 text-sm text-primary/70 shadow-md">
                  Nenhuma inscrita encontrada.
                </article>
              ) : (
                inscritosFiltrados.map((inscrito) => (
                  <article key={inscrito.id} className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
                    <p className="font-semibold">{inscrito.nome}</p>
                    <p className="text-sm text-primary/75">{inscrito.whatsapp}</p>
                    <p className="text-sm text-primary/75">{inscrito.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-primary/10 px-2 py-1">
                        {inscrito.status_pagamento}
                      </span>
                      <span className="rounded-full bg-secondary/20 px-2 py-1">
                        {inscrito.metodo_pagamento ?? "sem metodo"}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-1">
                        Check-in: {inscrito.check_in ? "sim" : "nao"}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <button
                        type="button"
                        disabled={actionLoadingId === inscrito.id}
                        onClick={() => void atualizarStatusPagamento(inscrito.id, inscrito.status_pagamento)}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-60 ${
                          inscrito.status_pagamento === "pago"
                            ? "border border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
                            : "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                        }`}
                      >
                        Pagamento: {inscrito.status_pagamento === "pago" ? "Confirmado" : "Pendente"}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === inscrito.id || inscrito.check_in}
                        onClick={() =>
                          void atualizarInscrito(inscrito.id, {
                            check_in: true,
                          })
                        }
                        className="rounded-xl border border-accent/70 bg-surface px-3 py-2 text-sm font-medium transition hover:border-primary disabled:opacity-60"
                      >
                        Check-in
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === inscrito.id}
                        onClick={() => void excluirInscrita(inscrito.id, inscrito.nome)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  </article>
                ))
              )}
            </section>

            <section className="hidden overflow-x-auto rounded-2xl border border-accent/70 bg-surface shadow-md md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-primary/5">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nome</th>
                    <th className="px-4 py-3 font-semibold">WhatsApp</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Pagamento</th>
                    <th className="px-4 py-3 font-semibold">Metodo</th>
                    <th className="px-4 py-3 font-semibold">Check-in</th>
                    <th className="px-4 py-3 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {inscritosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 text-center text-primary/70">
                        Nenhuma inscrita encontrada.
                      </td>
                    </tr>
                  ) : (
                    inscritosFiltrados.map((inscrito) => (
                      <tr key={inscrito.id} className="border-t border-primary/10">
                        <td className="px-4 py-3">{inscrito.nome}</td>
                        <td className="px-4 py-3">{inscrito.whatsapp}</td>
                        <td className="px-4 py-3">{inscrito.email}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            disabled={actionLoadingId === inscrito.id}
                            onClick={() =>
                              void atualizarStatusPagamento(inscrito.id, inscrito.status_pagamento)
                            }
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-60 ${
                              inscrito.status_pagamento === "pago"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }`}
                          >
                            {inscrito.status_pagamento === "pago" ? "Confirmado" : "Pendente"}
                          </button>
                        </td>
                        <td className="px-4 py-3">{inscrito.metodo_pagamento ?? "-"}</td>
                        <td className="px-4 py-3">{inscrito.check_in ? "Sim" : "Nao"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={actionLoadingId === inscrito.id || inscrito.check_in}
                              onClick={() =>
                                void atualizarInscrito(inscrito.id, {
                                  check_in: true,
                                })
                              }
                              className="rounded-lg border border-accent/70 bg-surface px-3 py-1.5 text-xs font-medium transition hover:border-primary disabled:opacity-60"
                            >
                              Check-in
                            </button>
                            <button
                              type="button"
                              disabled={actionLoadingId === inscrito.id}
                              onClick={() => void excluirInscrita(inscrito.id, inscrito.nome)}
                              className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
