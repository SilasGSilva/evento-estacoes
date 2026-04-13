"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, ShieldCheck, WifiOff } from "lucide-react";
import { Toaster, toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

type InscritoCheckin = {
  id: string;
  nome: string;
  whatsapp: string;
  check_in: boolean;
};

type PendingCheckin = {
  id: string;
  createdAt: string;
};

const CACHE_KEY = "checkin_inscritos_cache";
const PENDING_KEY = "pending_checkins";

function readPendingQueue(): PendingCheckin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingCheckin[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePendingQueue(queue: PendingCheckin[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(queue));
}

export default function AdminCheckinPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [inscritos, setInscritos] = useState<InscritoCheckin[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const inscritosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return inscritos;

    return inscritos.filter((item) => {
      return (
        item.nome.toLowerCase().includes(termo) || item.whatsapp.toLowerCase().includes(termo)
      );
    });
  }, [busca, inscritos]);

  const carregarInscritos = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error("Configure o Supabase para usar o check-in.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("inscritos")
      .select("id,nome,whatsapp,check_in")
      .order("created_at", { ascending: false });
    setLoading(false);

    if (error || !data) {
      const cache = window.localStorage.getItem(CACHE_KEY);
      if (cache) {
        try {
          const parsed = JSON.parse(cache) as InscritoCheckin[];
          setInscritos(parsed);
          toast.info("Sem conexão estável. Usando dados salvos localmente.");
          return;
        } catch {
          // ignora parse inválido
        }
      }
      toast.error("Não foi possível carregar inscritas.");
      return;
    }

    const lista = data as InscritoCheckin[];
    setInscritos(lista);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(lista));
  };

  const sincronizarPendencias = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!navigator.onLine) return;

    const queue = readPendingQueue();
    if (!queue.length) return;

    const pendentesRestantes: PendingCheckin[] = [];

    for (const item of queue) {
      const { error } = await supabase
        .from("inscritos")
        .update({ check_in: true })
        .eq("id", item.id);

      if (error) {
        pendentesRestantes.push(item);
      }
    }

    if (pendentesRestantes.length) {
      writePendingQueue(pendentesRestantes);
      toast.warning("Algumas presenças pendentes ainda não sincronizaram.");
      return;
    }

    window.localStorage.removeItem(PENDING_KEY);
    toast.success("Presenças pendentes sincronizadas com sucesso.");
    await carregarInscritos();
  };

  const confirmarPresenca = async (id: string) => {
    setActionLoadingId(id);
    setInscritos((prev) => prev.map((item) => (item.id === id ? { ...item, check_in: true } : item)));

    if (!isSupabaseConfigured || !supabase || !navigator.onLine) {
      const queue = readPendingQueue();
      if (!queue.some((item) => item.id === id)) {
        queue.push({ id, createdAt: new Date().toISOString() });
        writePendingQueue(queue);
      }
      toast.info("Check-in salvo offline. Será sincronizado ao reconectar.");
      setActionLoadingId(null);
      return;
    }

    const { error } = await supabase
      .from("inscritos")
      .update({ check_in: true })
      .eq("id", id);

    if (error) {
      const queue = readPendingQueue();
      if (!queue.some((item) => item.id === id)) {
        queue.push({ id, createdAt: new Date().toISOString() });
        writePendingQueue(queue);
      }
      toast.warning("Sem rede estável. Check-in adicionado à fila de sincronização.");
      setActionLoadingId(null);
      return;
    }

    await carregarInscritos();
    setActionLoadingId(null);
    toast.success("Presença confirmada.");
  };

  const autenticar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput }),
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
    await carregarInscritos();
    await sincronizarPendencias();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOffline(!window.navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      void sincronizarPendencias();
    };

    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-transparent px-4 py-12 text-primary sm:px-6 lg:px-8">
        <Toaster richColors position="top-center" />
        <section className="mx-auto w-full max-w-md rounded-2xl border border-accent/70 bg-surface p-6 shadow-md">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-secondary" />
            <h1 className="text-xl font-semibold">Check-in Administrativo</h1>
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
              className="w-full rounded-full bg-secondary px-4 py-3 font-semibold text-surface shadow-lg shadow-secondary/30 transition hover:scale-[1.02] disabled:opacity-70"
            >
              {authLoading ? "Validando..." : "Entrar no check-in"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-12 text-primary sm:px-6 lg:px-8">
      <Toaster richColors position="top-center" />

      <section className="mx-auto w-full max-w-5xl space-y-4">
        <header className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
          <h1 className="text-2xl font-semibold">Check-in do Evento</h1>
          <p className="mt-1 text-sm text-primary/80">
            Confirme presenças mesmo com internet oscilando.
          </p>
        </header>

        {isOffline && (
          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              ⚠️ Você está offline. As presenças serão sincronizadas assim que a conexão voltar.
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar por nome ou WhatsApp"
              className="w-full rounded-xl border border-accent/70 px-4 py-2.5 outline-none transition focus:border-primary sm:max-w-sm"
            />
            <button
              type="button"
              onClick={() => void sincronizarPendencias()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/70 bg-surface px-4 py-2.5 text-sm font-semibold transition hover:border-primary"
            >
              <RefreshCw className="h-4 w-4" />
              Sincronizar pendências
            </button>
          </div>
        </section>

        <section className="space-y-3">
          {loading ? (
            <article className="rounded-2xl border border-accent/70 bg-surface p-4 text-center shadow-md">
              Carregando inscritas...
            </article>
          ) : inscritosFiltrados.length === 0 ? (
            <article className="rounded-2xl border border-accent/70 bg-surface p-4 text-center text-sm shadow-md">
              Nenhuma inscrita encontrada.
            </article>
          ) : (
            inscritosFiltrados.map((inscrito) => (
              <article
                key={inscrito.id}
                className="rounded-2xl border border-accent/70 bg-surface p-4 shadow-md"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{inscrito.nome}</p>
                    <p className="text-sm text-primary/75">{inscrito.whatsapp}</p>
                    <p className="mt-1 text-xs">
                      Status:{" "}
                      <span
                        className={
                          inscrito.check_in
                            ? "font-semibold text-green-700"
                            : "font-semibold text-amber-700"
                        }
                      >
                        {inscrito.check_in ? "Presente" : "Pendente"}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={actionLoadingId === inscrito.id || inscrito.check_in}
                    onClick={() => void confirmarPresenca(inscrito.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-surface shadow-lg shadow-secondary/30 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    {inscrito.check_in ? "Presença confirmada" : "Confirmar Presença"}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
