import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  Key,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Save,
  CheckCircle2,
  HardDrive,
  ChevronRight,
} from "lucide-react";
import {
  useSettings,
  useSaveSettings,
  useUserKeys,
  useSaveUserKey,
  type LLMProvider,
} from "../../hooks/useSettings";
import { LoadingSpinner } from "../LoadingSpinner";

interface ProviderInfo {
  id: LLMProvider;
  name: string;
  badge?: string;
  description: string;
  defaultModel: string;
  getKeyUrl: string;
  placeholder: string;
  accentColor: string;
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Recommended",
    description:
      "Fast multimodal models with generous free tier and low latency.",
    defaultModel: "gemini-1.5-flash",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
    placeholder: "AIzaSy...",
    accentColor: "from-blue-500/20 to-indigo-500/10 border-blue-500/40",
  },
  {
    id: "groq",
    name: "Groq LPU",
    description: "Ultra-fast inference engine powered by custom LPU hardware.",
    defaultModel: "llama-3.3-70b-versatile",
    getKeyUrl: "https://console.groq.com/keys",
    placeholder: "gsk_...",
    accentColor: "from-amber-500/20 to-orange-500/10 border-amber-500/40",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description:
      "Unified API gateway to Claude 3.5, GPT-4o, DeepSeek & 100+ LLMs.",
    defaultModel: "anthropic/claude-3.5-sonnet",
    getKeyUrl: "https://openrouter.ai/keys",
    placeholder: "sk-or-v1-...",
    accentColor: "from-purple-500/20 to-pink-500/10 border-purple-500/40",
  },
];

export function SettingsScreen() {
  const navigate = useNavigate();

  // Queries & Mutations
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: userKeys = [], isLoading: keysLoading } = useUserKeys();
  const saveSettings = useSaveSettings();
  const saveUserKey = useSaveUserKey();

  // Form states
  const [selectedProvider, setSelectedProvider] =
    useState<LLMProvider>("gemini");
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({
    gemini: "",
    groq: "",
    openrouter: "",
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [customInstructions, setCustomInstructions] = useState("");

  // Feedback notifications
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Sync state from server on fetch
  useEffect(() => {
    if (settings?.defaultProvider) {
      setSelectedProvider(settings.defaultProvider as LLMProvider);
    }
    if (settings?.customInstructions) {
      setCustomInstructions(settings.customInstructions);
    }
  }, [settings]);

  useEffect(() => {
    if (userKeys && userKeys.length > 0) {
      const keysMap: Record<string, string> = {
        gemini: "",
        groq: "",
        openrouter: "",
      };
      userKeys.forEach((k) => {
        if (k.provider && k.key) {
          keysMap[k.provider] = k.key;
        }
      });
      setKeyInputs(keysMap);
    }
  }, [userKeys]);

  const showNotification = (
    text: string,
    type: "success" | "error" = "success",
  ) => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Check if provider has configured key
  const hasKey = (providerId: string) => {
    const val = keyInputs[providerId];
    return Boolean(val && val.trim().length > 0);
  };

  const handleSelectProvider = async (providerId: LLMProvider) => {
    setSelectedProvider(providerId);
    try {
      await saveSettings.mutateAsync({ defaultProvider: providerId });
      showNotification(
        `Default provider set to ${PROVIDERS.find((p) => p.id === providerId)?.name}`,
      );
    } catch (err: any) {
      showNotification("Failed to update default provider", "error");
    }
  };

  const handleSaveKey = async (providerId: string) => {
    const keyVal = keyInputs[providerId]?.trim();
    if (!keyVal) {
      showNotification(
        `Please enter a valid API key for ${providerId}`,
        "error",
      );
      return;
    }

    try {
      await saveUserKey.mutateAsync({ provider: providerId, key: keyVal });
      showNotification(
        `API Key for ${providerId.toUpperCase()} saved securely`,
      );
    } catch (err: any) {
      showNotification(`Failed to save API key for ${providerId}`, "error");
    }
  };

  const handleSaveInstructions = async () => {
    try {
      await saveSettings.mutateAsync({ customInstructions });
      showNotification("Custom AI instructions saved");
    } catch (err: any) {
      showNotification("Failed to save instructions", "error");
    }
  };

  const toggleShowKey = (providerId: string) => {
    setShowKeys((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  if (settingsLoading || keysLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <LoadingSpinner />
        <span className="text-xs font-mono text-text-muted">
          Loading settings...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Banner Navigation */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 rounded-md hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title="Back to Workspace"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
              <span
                onClick={() => navigate("/")}
                className="hover:underline cursor-pointer flex items-center gap-1"
              >
                <HardDrive size={12} />
                workspace
              </span>
              <ChevronRight size={12} />
              <span className="text-text-primary">settings</span>
            </div>
            <h1 className="text-xl font-bold font-sans tracking-tight text-text-primary mt-0.5">
              LLM & AI Configuration
            </h1>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={14} className="text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Section 1: Default LLM Provider Selection */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold font-sans text-text-primary flex items-center gap-2">
              <Cpu size={16} className="text-accent" />
              Default LLM Provider
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Choose the primary AI backend to power note polishing, synthesis,
              and dev notes generation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROVIDERS.map((provider) => {
            const isSelected = selectedProvider === provider.id;
            const configured = hasKey(provider.id);

            return (
              <div
                key={provider.id}
                onClick={() => handleSelectProvider(provider.id)}
                className={`relative group p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `bg-gradient-to-b ${provider.accentColor} border-accent shadow-md`
                    : "bg-bg-surface border-border-subtle hover:border-border-strong hover:bg-bg-elevated/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-text-primary">
                        {provider.name}
                      </span>
                      {provider.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-accent/20 text-accent border border-accent/30">
                          {provider.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-accent text-bg-surface flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed mb-3">
                    {provider.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border-subtle/50 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-text-muted truncate max-w-[140px]">
                    {provider.defaultModel}
                  </span>

                  {configured ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Key Set
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-400/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                      No Key
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: API Keys Management */}
      <section className="space-y-4 pt-2">
        <div>
          <h2 className="text-sm font-semibold font-sans text-text-primary flex items-center gap-2">
            <Key size={16} className="text-accent" />
            API Keys Management
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Your API keys are encrypted at rest using secret AES encryption and
            stored securely per user.
          </p>
        </div>

        <div className="space-y-4">
          {PROVIDERS.map((provider) => {
            const keyVal = keyInputs[provider.id] || "";
            const isShowing = showKeys[provider.id] || false;
            const isSavingKey =
              saveUserKey.isPending &&
              saveUserKey.variables?.provider === provider.id;
            const configured = hasKey(provider.id);

            return (
              <div
                key={provider.id}
                className={`p-4 rounded-xl bg-bg-surface border transition-all ${
                  selectedProvider === provider.id
                    ? "border-accent/40 shadow-xs"
                    : "border-border-subtle"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs font-mono text-text-primary">
                      {provider.name} API Key
                    </span>
                    {configured ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                        <ShieldCheck size={11} /> Configured
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                        <AlertCircle size={11} /> Key Required
                      </span>
                    )}
                  </div>

                  <a
                    href={provider.getKeyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-text-muted hover:text-accent flex items-center gap-1 transition-colors"
                  >
                    <span>Get Key</span>
                    <ExternalLink size={11} />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isShowing ? "text" : "password"}
                      value={keyVal}
                      onChange={(e) =>
                        setKeyInputs((prev) => ({
                          ...prev,
                          [provider.id]: e.target.value,
                        }))
                      }
                      placeholder={provider.placeholder}
                      className="w-full h-9 px-3 pr-10 rounded-lg bg-bg-primary border border-border-subtle focus:border-accent focus:outline-none text-xs font-mono text-text-primary placeholder:text-text-muted/40 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(provider.id)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      title={isShowing ? "Hide API key" : "Show API key"}
                    >
                      {isShowing ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleSaveKey(provider.id)}
                    disabled={isSavingKey}
                    className="h-9 px-3.5 rounded-lg bg-text-primary text-bg-surface hover:opacity-90 active:scale-[0.98] disabled:opacity-50 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                  >
                    {isSavingKey ? (
                      <LoadingSpinner
                        style={{
                          borderColor: "rgba(0,0,0,0.2)",
                          borderLeftColor: "#000",
                        }}
                      />
                    ) : (
                      <Save size={13} />
                    )}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Custom Instructions / System Persona */}
      <section className="space-y-4 pt-2">
        <div>
          <h2 className="text-sm font-semibold font-sans text-text-primary flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            Custom AI System Instructions
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Provide personalized guidelines for how AI should polish and
            organize your notes (e.g. preferred tone, formatting, or tech stack
            context).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-bg-surface border border-border-subtle space-y-3">
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            maxLength={450}
            rows={3}
            placeholder="e.g. Format output with clean markdown headings. Highlight key code snippets using TypeScript, and keep summaries concise."
            className="w-full p-3 rounded-lg bg-bg-primary border border-border-subtle focus:border-accent focus:outline-none text-xs font-sans text-text-primary placeholder:text-text-muted/40 transition-colors resize-none"
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
            <span>{customInstructions.length} / 450 characters</span>
            <button
              onClick={handleSaveInstructions}
              disabled={saveSettings.isPending}
              className="h-8 px-3 rounded-lg bg-bg-elevated border border-border-subtle hover:border-border-strong text-text-primary hover:bg-bg-primary text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {saveSettings.isPending ? <LoadingSpinner /> : <Save size={12} />}
              <span>Save Prompt</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
