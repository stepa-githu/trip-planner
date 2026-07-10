"use client";

import { useEffect, useState } from "react";

type PromptRow = {
  id: string;
  name: string;
  version: string;
  description: string | null;
  prompt_type: string;
  provider: string | null;
  model: string | null;
  system_prompt: string;
  user_prompt_template: string;
  temperature: number | null;
  max_output_tokens: number | null;
  is_active: boolean;
};

type DashboardData = {
  stats: {
    requests: number;
    generations: number;
    results: number;
    feedback: number;
  };
  recentRequests: Array<{
    id: string;
    created_at: string;
    destination_mode: string;
    destination: string | null;
    duration: string;
    moods: string[];
    transport: string;
  }>;
  recentErrors: Array<{
    id: string;
    created_at: string;
    provider: string;
    model: string;
    status: string;
    error_message: string | null;
  }>;
  prompts: PromptRow[];
  configuration: {
    provider: string;
    openaiModel: string;
    geminiModel: string;
  };
};

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptRow | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadDashboard() {
    setIsLoading(true);

    const response = await fetch("/api/admin/dashboard", {
      cache: "no-store"
    });

    if (response.status === 401) {
      setIsAuthenticated(false);
      setData(null);
      setIsLoading(false);
      return;
    }

    const result = await response.json();

    if (!response.ok || !result.success) {
      setMessage(result.error || "Errore caricamento.");
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setData(result);

    if (!selectedPrompt && result.prompts.length > 0) {
      setSelectedPrompt(result.prompts[0]);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setMessage(result.error || "Login non riuscito.");
      return;
    }

    setPassword("");
    await loadDashboard();
  }

  async function handleLogout() {
    await fetch("/api/admin/login", {
      method: "DELETE"
    });

    setIsAuthenticated(false);
    setData(null);
    setSelectedPrompt(null);
  }

  async function handleSavePrompt() {
    if (!selectedPrompt) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/prompts", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: selectedPrompt.id,
        name: selectedPrompt.name,
        version: selectedPrompt.version,
        description: selectedPrompt.description || "",
        promptType: selectedPrompt.prompt_type,
        provider: selectedPrompt.provider || "",
        model: selectedPrompt.model || "",
        systemPrompt: selectedPrompt.system_prompt,
        userPromptTemplate: selectedPrompt.user_prompt_template,
        temperature: Number(selectedPrompt.temperature ?? 0.3),
        maxOutputTokens: Number(selectedPrompt.max_output_tokens ?? 8192),
        isActive: selectedPrompt.is_active
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setMessage(result.error || "Errore salvataggio prompt.");
      setIsSaving(false);
      return;
    }

    setMessage("Prompt salvato correttamente.");
    setSelectedPrompt(result.prompt);
    await loadDashboard();
    setIsSaving(false);
  }

  function updatePrompt<K extends keyof PromptRow>(
    field: K,
    value: PromptRow[K]
  ) {
    setSelectedPrompt((current) =>
      current
        ? {
            ...current,
            [field]: value
          }
        : current
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8">
          Caricamento admin...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-sm"
        >
          <p className="text-sm font-bold text-violet-600">Trip Planner</p>
          <h1 className="mt-1 text-2xl font-black">Area amministrazione</h1>

          <label className="mt-6 block text-sm font-bold">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-violet-500"
          />

          <button
            type="submit"
            className="mt-4 h-12 w-full rounded-2xl bg-violet-600 font-bold text-white"
          >
            Accedi
          </button>

          {message ? (
            <p className="mt-4 text-sm text-red-600">{message}</p>
          ) : null}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-violet-600">
              Trip Planner
            </p>
            <h1 className="text-3xl font-black">Amministrazione</h1>
            <p className="mt-1 text-sm text-slate-500">
              Provider: {data?.configuration.provider}
              {data?.configuration.geminiModel
                ? ` · ${data.configuration.geminiModel}`
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
          >
            Esci
          </button>
        </header>

        {message ? (
          <div className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Richieste", data?.stats.requests || 0],
            ["Generazioni", data?.stats.generations || 0],
            ["Risultati", data?.stats.results || 0],
            ["Feedback", data?.stats.feedback || 0]
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-4xl font-black">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Prompt AI</h2>

          <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="space-y-2">
              {data?.prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`w-full rounded-2xl border p-4 text-left ${
                    selectedPrompt?.id === prompt.id
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black">{prompt.name}</p>
                    {prompt.is_active ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                        Attivo
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {prompt.version} · {prompt.prompt_type}
                  </p>
                </button>
              ))}
            </div>

            {selectedPrompt ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <AdminInput
                    label="Nome"
                    value={selectedPrompt.name}
                    onChange={(value) => updatePrompt("name", value)}
                  />

                  <AdminInput
                    label="Versione"
                    value={selectedPrompt.version}
                    onChange={(value) => updatePrompt("version", value)}
                  />

                  <AdminInput
                    label="Tipo prompt"
                    value={selectedPrompt.prompt_type}
                    onChange={(value) =>
                      updatePrompt("prompt_type", value)
                    }
                  />

                  <AdminInput
                    label="Provider"
                    value={selectedPrompt.provider || ""}
                    onChange={(value) => updatePrompt("provider", value)}
                  />

                  <AdminInput
                    label="Modello"
                    value={selectedPrompt.model || ""}
                    onChange={(value) => updatePrompt("model", value)}
                  />

                  <AdminInput
                    label="Max output token"
                    type="number"
                    value={String(
                      selectedPrompt.max_output_tokens ?? 8192
                    )}
                    onChange={(value) =>
                      updatePrompt(
                        "max_output_tokens",
                        Number(value)
                      )
                    }
                  />
                </div>

                <label className="block">
                  <span className="text-sm font-bold">Descrizione</span>
                  <input
                    value={selectedPrompt.description || ""}
                    onChange={(event) =>
                      updatePrompt("description", event.target.value)
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">System prompt</span>
                  <textarea
                    value={selectedPrompt.system_prompt}
                    onChange={(event) =>
                      updatePrompt(
                        "system_prompt",
                        event.target.value
                      )
                    }
                    rows={14}
                    className="mt-2 w-full rounded-2xl border border-slate-200 p-4 font-mono text-sm"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">
                    User prompt template
                  </span>
                  <textarea
                    value={selectedPrompt.user_prompt_template}
                    onChange={(event) =>
                      updatePrompt(
                        "user_prompt_template",
                        event.target.value
                      )
                    }
                    rows={8}
                    className="mt-2 w-full rounded-2xl border border-slate-200 p-4 font-mono text-sm"
                  />
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3 text-sm font-bold">
                    <input
                      type="checkbox"
                      checked={selectedPrompt.is_active}
                      onChange={(event) =>
                        updatePrompt(
                          "is_active",
                          event.target.checked
                        )
                      }
                    />
                    Prompt attivo
                  </label>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSavePrompt}
                    className="rounded-2xl bg-violet-600 px-6 py-3 font-bold text-white disabled:opacity-50"
                  >
                    {isSaving ? "Salvataggio..." : "Salva prompt"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Nessun prompt presente.
              </p>
            )}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Ultime richieste</h2>

            <div className="mt-4 space-y-3">
              {data?.recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <p className="font-black">
                    {request.destination ||
                      "Destinazione a sorpresa"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {request.duration} · {request.transport}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(request.created_at).toLocaleString("it-IT")}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Ultimi errori</h2>

            <div className="mt-4 space-y-3">
              {data?.recentErrors.length ? (
                data.recentErrors.map((error) => (
                  <div
                    key={error.id}
                    className="rounded-2xl border border-red-200 bg-red-50 p-4"
                  >
                    <p className="font-black text-red-800">
                      {error.provider} · {error.model}
                    </p>
                    <p className="mt-1 text-sm text-red-700">
                      {error.error_message || "Errore non specificato"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Nessun errore registrato.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AdminInput({
  label,
  value,
  type = "text",
  onChange
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
      />
    </label>
  );
}