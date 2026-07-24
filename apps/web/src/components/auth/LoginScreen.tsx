import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sun, Moon, ShieldCheck, Cpu, Zap } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { useTheme } from "../../hooks/useTheme";
import { LoadingSpinner } from "../LoadingSpinner";

interface LoginScreenProps {
  mode: "signin" | "signup";
}

/**
 * Rebuilt Raycast / Vercel dark theme Auth screen.
 */
export function LoginScreen({ mode }: LoginScreenProps) {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (session) navigate("/");
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (mode === "signin") {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) {
          setErrorMsg(res.error.message || "Failed to sign in.");
        } else {
          navigate("/");
        }
      } else {
        const res = await authClient.signUp.email({ email, password, name });
        if (res.error) {
          setErrorMsg(res.error.message || "Failed to sign up.");
        } else {
          const loginRes = await authClient.signIn.email({ email, password });
          if (loginRes.error) {
            setErrorMsg("Account created, but sign-in failed. Please log in manually.");
            navigate("/login");
          } else {
            navigate("/");
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-bg-primary select-none">
      {/* Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative bg-bg-primary">
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={16} className="text-amber-400" />
          ) : (
            <Moon size={16} />
          )}
        </button>

        <div className="w-full max-w-sm bg-bg-surface border border-border-subtle rounded-lg p-6 shadow-2xl">
          {/* Brand Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-text-primary text-bg-surface flex items-center justify-center font-mono font-bold text-xs">
                {">_"}
              </div>
              <span className="text-sm font-bold tracking-tight text-text-primary font-mono">
                thedevjournal.io
              </span>
            </div>
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border border-border-subtle text-text-muted bg-bg-elevated">
              {mode === "signin" ? "AUTH" : "REG"}
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-lg font-bold tracking-tight text-text-primary font-sans mb-1">
              {mode === "signin" ? "Welcome back" : "Create developer account"}
            </h1>
            <p className="text-xs text-text-muted font-sans">
              {mode === "signin"
                ? "Enter your credentials to access your workspace."
                : "Initialize your dev notes workspace."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded text-xs mb-4 border bg-red-500/10 border-red-500/20 text-red-400 font-mono">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {mode === "signup" && (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="name"
                  className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted"
                >
                  Developer Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full h-8 px-2.5 bg-bg-primary border border-border-subtle rounded text-text-primary text-xs outline-none focus:border-border-strong transition-colors font-sans"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full h-8 px-2.5 bg-bg-primary border border-border-subtle rounded text-text-primary text-xs outline-none focus:border-border-strong transition-colors font-sans"
                placeholder="developer@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="password"
                className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-muted"
              >
                Security Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full h-8 px-2.5 bg-bg-primary border border-border-subtle rounded text-text-primary text-xs outline-none focus:border-border-strong transition-colors font-sans"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-8 mt-2 inline-flex items-center justify-center gap-1.5 px-3 rounded text-xs font-medium bg-text-primary text-bg-surface hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner
                  style={{
                    borderColor: "rgba(0,0,0,0.2)",
                    borderLeftColor: "#000",
                  }}
                />
              ) : (
                <>
                  <span>{mode === "signin" ? "Authenticate" : "Create Account"}</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-border-subtle text-center">
            <p className="text-xs text-text-muted font-sans">
              {mode === "signin" ? (
                <>
                  New developer?{" "}
                  <button
                    type="button"
                    className="text-text-primary font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
                    onClick={() => navigate("/signup")}
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    className="text-text-primary font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
                    onClick={() => navigate("/login")}
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Senior Developer Technical Showcase Panel (Raycast Aesthetic) */}
      <div className="hidden lg:flex flex-1 bg-bg-surface items-center justify-center p-12 border-l border-border-subtle relative overflow-hidden">
        <div className="w-full max-w-md flex flex-col gap-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ● Engineering Workspace
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-text-primary font-sans">
            Built for engineers who care about speed, clarity, and deep work.
          </h2>

          <div className="flex flex-col gap-3 font-mono text-xs text-text-secondary">
            <div className="flex items-start gap-3 p-3 rounded border border-border-subtle bg-bg-primary">
              <Zap size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary block mb-0.5">Keyboard First</span>
                <span className="text-[11px] text-text-muted font-sans leading-normal">
                  Command menu integration, fast slash `/` blocks, and immediate markdown scratchpads.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded border border-border-subtle bg-bg-primary">
              <Cpu size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary block mb-0.5">AI Synthesis</span>
                <span className="text-[11px] text-text-muted font-sans leading-normal">
                  Transform raw notes into clean, structured technical documentation with one click.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded border border-border-subtle bg-bg-primary">
              <ShieldCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-text-primary block mb-0.5">Secure Architecture</span>
                <span className="text-[11px] text-text-muted font-sans leading-normal">
                  Encrypted keys, PostgreSQL schema, zero clutter, zero telemetry bloat.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-[10px] font-mono text-text-muted">
            <span>THE DEV JOURNAL SYSTEM</span>
            <span>ENCRYPTED & SYNCED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
