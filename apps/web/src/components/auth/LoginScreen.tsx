import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { authClient } from "../../lib/auth-client";
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
    <div className="login-container">
      {/* Form Side */}
      <div className="login-form-side">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h1>thedevjournal</h1>
            <p>
              {mode === "signin"
                ? "Enter your credentials to continue"
                : "Create an account to begin journaling"}
            </p>
          </div>

          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  className="text-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="text-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="text-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "8px" }}
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

          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginTop: "24px",
              textAlign: "center",
            }}
          >
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <span
                  style={{ color: "var(--accent)", cursor: "pointer" }}
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  style={{ color: "var(--accent)", cursor: "pointer" }}
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
      <div className="login-art-side">
        <div className="dithered-pattern"></div>
        <pre className="ascii-art">
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
