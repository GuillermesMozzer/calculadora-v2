import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { TakingLogo } from "@/components/TakingLogo";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const ok = login(email, password);
    setSubmitting(false);
    if (!ok) {
      setError("Informe e-mail e senha.");
      return;
    }
    navigate("/app", { replace: true });
  }

  return (
    <div className="min-h-screen text-zinc-100">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-12 px-6 py-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col justify-between">
          <TakingLogo height={36} />
          <div className="py-12 lg:py-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-taking">
              Calculadora V2
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Take over
              <br />
              your <span className="italic text-white/90">margin</span>
              <span className="text-taking">.</span>
            </h1>
            <p className="mt-6 max-w-md text-base text-zinc-500">
              Precificação de talentos Taking — margem, ratecard, montagem de time e saúde da
              operação em um cockpit único.
            </p>
          </div>
          <p className="hidden text-xs text-zinc-600 lg:block">
            © {new Date().getFullYear()} Grupo Taking — Take over your future.
          </p>
        </div>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="glass rounded-3xl p-6 shadow-glow sm:p-8">
            <h2 className="text-xl font-semibold text-white">Entrar</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Qualquer e-mail e senha válidos (demo).
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-medium text-zinc-500">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@taking.com.br"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-surface-overlay px-3 py-2.5 text-sm text-white outline-none focus:border-taking/50 focus:ring-1 focus:ring-taking/30"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-medium text-zinc-500">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-surface-overlay px-3 py-2.5 text-sm text-white outline-none focus:border-taking/50 focus:ring-1 focus:ring-taking/30"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-taking py-3 text-sm font-semibold text-white transition-colors hover:bg-taking-hover disabled:opacity-60"
              >
                {submitting ? "Entrando…" : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
