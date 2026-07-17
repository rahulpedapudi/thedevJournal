import { useState, useEffect } from "react";
import { 
  authClient 
} from "./lib/auth-client";
import { 
  LogIn, 
  UserPlus, 
  LogOut, 
  ShieldCheck, 
  KeyRound, 
  User, 
  Mail, 
  Terminal, 
  Globe, 
  Cpu, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft
} from "lucide-react";
import "./App.css";

type Screen = "welcome" | "signin" | "signup" | "dashboard";

function App() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync screen with session state
  useEffect(() => {
    if (!isPending) {
      if (session) {
        setCurrentScreen("dashboard");
      } else if (currentScreen === "dashboard") {
        setCurrentScreen("welcome");
      }
    }
  }, [session, isPending]);

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        setErrorMsg(response.error.message || "Failed to sign in.");
      } else {
        setSuccessMsg("Signed in successfully!");
        await refetch();
        setCurrentScreen("dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (response.error) {
        setErrorMsg(response.error.message || "Failed to sign up.");
      } else {
        setSuccessMsg("Account created! Logging you in...");
        // Auto sign in the user
        const loginResponse = await authClient.signIn.email({
          email,
          password,
        });
        
        if (loginResponse.error) {
          setErrorMsg("Account created, but automatic sign-in failed. Please sign in manually.");
          setCurrentScreen("signin");
        } else {
          await refetch();
          setCurrentScreen("dashboard");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
      clearMessages();
      setEmail("");
      setPassword("");
      setName("");
      setCurrentScreen("welcome");
      await refetch();
    } catch (err: any) {
      setErrorMsg("Failed to sign out.");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="loading-screen">
        <Loader2 className="spinner animate-spin" size={48} />
        <p>Loading application state...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Decorative Blur Background Circles */}
      <div className="bg-glow bg-glow-primary"></div>
      <div className="bg-glow bg-glow-secondary"></div>

      {/* Main Content Area */}
      <main className="content-wrapper">
        
        {/* Welcome / Landing Screen */}
        {currentScreen === "welcome" && (
          <div className="card welcome-card animate-fade-in">
            <div className="brand-header">
              <div className="shield-icon-container">
                <ShieldCheck className="shield-icon" size={40} />
              </div>
              <h1 className="brand-title">Antigravity Auth</h1>
              <p className="brand-subtitle">
                A premium, secure client-side portal powered by Better Auth.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-item">
                <KeyRound className="feature-icon" size={20} />
                <div>
                  <h3>Secure Credentials</h3>
                  <p>Hashed passwords, secure HTTP-only session cookies, and CSRF protection built-in.</p>
                </div>
              </div>
              <div className="feature-item">
                <Terminal className="feature-icon" size={20} />
                <div>
                  <h3>Express Backend Integration</h3>
                  <p>Verifies active sessions dynamically across independent local network hosts.</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                onClick={() => { clearMessages(); setCurrentScreen("signin"); }}
                className="btn btn-primary"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
              <button 
                onClick={() => { clearMessages(); setCurrentScreen("signup"); }}
                className="btn btn-secondary"
              >
                <UserPlus size={18} />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Sign In Screen */}
        {currentScreen === "signin" && (
          <div className="card form-card animate-fade-in">
            <button 
              onClick={() => setCurrentScreen("welcome")} 
              className="btn-back"
              disabled={loading}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Enter your credentials to access your session portal.</p>
            </div>

            {errorMsg && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <KeyRound className="input-icon" size={18} />
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Don't have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => { clearMessages(); setCurrentScreen("signup"); }}
                  disabled={loading}
                >
                  Create one now
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Sign Up Screen */}
        {currentScreen === "signup" && (
          <div className="card form-card animate-fade-in">
            <button 
              onClick={() => setCurrentScreen("welcome")} 
              className="btn-back"
              disabled={loading}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="form-header">
              <h2>Create Account</h2>
              <p>Sign up to generate and verify your active session token.</p>
            </div>

            {errorMsg && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <KeyRound className="input-icon" size={18} />
                  <input
                    type="password"
                    id="password"
                    placeholder="•••••••• (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="form-footer">
              <p>
                Already have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => { clearMessages(); setCurrentScreen("signin"); }}
                  disabled={loading}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Screen */}
        {currentScreen === "dashboard" && session && (
          <div className="dashboard-layout animate-fade-in">
            {/* Header */}
            <header className="dashboard-header card">
              <div className="header-user-info">
                <div className="avatar">
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : <User size={18} />}
                </div>
                <div>
                  <h2>Welcome, {session.user.name}</h2>
                  <p>{session.user.email}</p>
                </div>
              </div>
              <button onClick={handleSignOut} className="btn btn-danger" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                <span>Sign Out</span>
              </button>
            </header>

            {/* Dashboard Content Grid */}
            <div className="dashboard-grid">
              
              {/* Verification Info Box */}
              <div className="card grid-span-2 status-card">
                <div className="status-header">
                  <div className="status-badge">
                    <CheckCircle2 className="badge-icon" size={16} />
                    <span>Session Verified</span>
                  </div>
                  <h3>Auth Status Checklist</h3>
                </div>
                
                <div className="checklist-items">
                  <div className="checklist-item done">
                    <CheckCircle2 className="check-icon" size={18} />
                    <div>
                      <h4>Client Connection</h4>
                      <p>Frontend successfully established session with host port 3000</p>
                    </div>
                  </div>
                  <div className="checklist-item done">
                    <CheckCircle2 className="check-icon" size={18} />
                    <div>
                      <h4>Better Auth Session Tokens</h4>
                      <p>Valid cookie stored and verified against Supabase database schema</p>
                    </div>
                  </div>
                  <div className="checklist-item done">
                    <CheckCircle2 className="check-icon" size={18} />
                    <div>
                      <h4>CORS & Headers</h4>
                      <p>Express credentials security preflights accepted by the API</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Profile Card */}
              <div className="card">
                <div className="card-header">
                  <User size={20} className="card-header-icon" />
                  <h3>User Profile</h3>
                </div>
                <div className="profile-details">
                  <div className="detail-row">
                    <span className="label">Name</span>
                    <span className="value">{session.user.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email Address</span>
                    <span className="value">{session.user.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email Verified</span>
                    <span className="value">
                      {session.user.emailVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Registered On</span>
                    <span className="value">
                      {new Date(session.user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Session Metadata */}
              <div className="card">
                <div className="card-header">
                  <Cpu size={20} className="card-header-icon" />
                  <h3>Metadata Diagnostics</h3>
                </div>
                <div className="profile-details">
                  <div className="detail-row">
                    <span className="label">Session ID</span>
                    <span className="value monospace truncated" title={session.session.id}>
                      {session.session.id}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">IP Address</span>
                    <span className="value monospace">
                      {session.session.ipAddress || "127.0.0.1"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">User Agent</span>
                    <span className="value truncated" title={session.session.userAgent || "Unknown"}>
                      {session.session.userAgent || "Chrome / WebKit Client"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Session Expires</span>
                    <span className="value monospace">
                      {new Date(session.session.expiresAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw JSON Debugging Card */}
              <div className="card grid-span-2 raw-data-card">
                <div className="card-header">
                  <Terminal size={20} className="card-header-icon" />
                  <h3>Raw Session Payload (Debugger)</h3>
                </div>
                <div className="code-viewer">
                  <pre>
                    <code>{JSON.stringify(session, null, 2)}</code>
                  </pre>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
