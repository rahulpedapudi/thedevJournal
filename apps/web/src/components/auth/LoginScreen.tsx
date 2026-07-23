import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { authClient } from "../../lib/auth-client";
import { useTheme } from "../../hooks/useTheme";
import { LoadingSpinner } from "../LoadingSpinner";

interface LoginScreenProps {
  mode: "signin" | "signup";
}

/**
 * Shared login / signup screen.
 * Renders a two-panel layout: a form on the left, retro ASCII art on the right.
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

  // Redirect already-authenticated users straight to the workspace
  useEffect(() => {
    if (session) navigate("/");
  }, [session]);

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
          // Auto-login after sign-up
          const loginRes = await authClient.signIn.email({ email, password });
          if (loginRes.error) {
            setErrorMsg(
              "Account created, but sign-in failed. Please log in manually."
            );
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
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-bg-surface">
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-bg-surface relative">
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-text-primary/5 transition-colors cursor-pointer"
          title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} />
          )}
        </button>

        <div className="w-full max-w-[320px]">
          <div className="mb-8">
            <h1 className="text-xl font-medium tracking-tight mb-2 text-text-primary">
              thedevjournal
            </h1>
            <p className="text-text-secondary text-xs">
              {mode === "signin"
                ? "Enter your credentials to continue"
                : "Create an account to begin journaling"}
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 px-3.5 rounded-md text-xs mb-4 border bg-red-500/10 border-red-500/20 text-red-500">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5 mb-4">
                <label
                  htmlFor="name"
                  className="text-[11px] font-medium uppercase tracking-wider text-text-secondary"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full h-9 px-3 bg-bg-surface border border-border-subtle rounded-md text-text-primary text-xs outline-none focus:border-text-primary transition-colors"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5 mb-4">
              <label
                htmlFor="email"
                className="text-[11px] font-medium uppercase tracking-wider text-text-secondary"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full h-9 px-3 bg-bg-surface border border-border-subtle rounded-md text-text-primary text-xs outline-none focus:border-text-primary transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 mb-4">
              <label
                htmlFor="password"
                className="text-[11px] font-medium uppercase tracking-wider text-text-secondary"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full h-9 px-3 bg-bg-surface border border-border-subtle rounded-md text-text-primary text-xs outline-none focus:border-text-primary transition-colors"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-8.5 mt-2 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-md text-xs font-medium bg-text-primary text-bg-surface hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner
                  style={{
                    borderColor: "rgba(255,255,255,0.2)",
                    borderLeftColor: "#fff",
                  }}
                />
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In" : "Sign Up"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-text-secondary mt-6 text-center">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <span
                  className="text-accent cursor-pointer hover:underline"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className="text-accent cursor-pointer hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Retro Dithered Art Side */}
      <div className="hidden lg:flex flex-[1.2] bg-[#111110] items-center justify-center relative overflow-hidden border-l border-border-subtle">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-size-[8px_8px]"></div>
        <pre className="font-mono text-[10px] leading-tight text-[#888887] whitespace-pre select-none text-left z-10">
{`+-------------------------------------------------------------+
|                                                             |
|   .---.                                                     |
|  /     \\  __  __   __   _  _   __   __   _  _  _  _  _      |
|  |     | (  \\/  ) /__\\ ( \\/ ) /__\\ / _\\ ( \\/ )( \\/ ) \\     |
|  \\     /  )    ( /(__)\\ \\  / /(__)\\\\_  \\_)  (  \\  /  /     |
|   '---'  (_/\\/\\_)(__)(__) \\/ (__)(__)__)(_/\\_)  \\/  (      |
|                                                             |
|  JOURNAL SYSTEM v1.0.0 // STATUS: READY                    |
|  SESSION KEY: D5A3-9F2B-1E8C                                |
|                                                             |
|  [|||||||||||||||||||||||||||||||||||||||||||||||] 100%     |
|                                                             |
|  .........................................................  |
|  ..* * * * * * * * * * * * * * * * * * * * * * * * * * *..  |
|  ..*                                                   *..  |
|  ..*   SYS.LOC: /dev/journal                           *..  |
|  ..*   MEM.USE: 4.12 MB / 64.00 MB                     *..  |
|  ..*   NET.CON: ONLINE (PORT 3000)                     *..  |
|  ..*                                                   *..  |
|  ..* * * * * * * * * * * * * * * * * * * * * * * * * * *..  |
|  .........................................................  |
|                                                             |
+-------------------------------------------------------------+`}
        </pre>
      </div>
    </div>
  );
}
