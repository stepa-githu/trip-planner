"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const travelerTypes = ["Coppia", "Famiglia", "Amici", "Solo traveller", "Over 60"];
const moods = ["Relax", "Avventura", "Food & Wine", "Natura", "Cultura", "Romantico", "Mare", "Borghi"];
const transports = [
  { label: "Auto", value: "car" },
  { label: "Treno", value: "train" },
  { label: "Aereo", value: "flight" },
  { label: "A piedi/bici", value: "walk_bike" },
  { label: "Non so", value: "unknown" }
] as const;

const durations = [
  { label: "1 giorno", value: "1_day" },
  { label: "Weekend", value: "weekend" },
  { label: "3-5 giorni", value: "3_5_days" },
  { label: "1 settimana", value: "1_week" },
  { label: "10+ giorni", value: "10_plus_days" }
] as const;

function toggleValue(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

export function TripPlannerCard() {
  const router = useRouter();

  const [destinationMode, setDestinationMode] = useState<"specific" | "surprise">("specific");
  const [destination, setDestination] = useState("");
  const [flexiblePeriod, setFlexiblePeriod] = useState("Primavera o estate");
  const [duration, setDuration] = useState("weekend");

  const [selectedTravelerTypes, setSelectedTravelerTypes] = useState<string[]>(["Coppia"]);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [selectedMoods, setSelectedMoods] = useState<string[]>(["Relax", "Natura"]);
  const [transport, setTransport] = useState("car");
  const [rhythm, setRhythm] = useState<"slow" | "balanced" | "intense">("balanced");
  const [activityLevel, setActivityLevel] = useState<"comfortable" | "active" | "sporty">("active");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
  setIsLoading(true);
  setErrorMessage("");

  const payload = {
    destinationMode,
    destination,
    departurePlace: "",
    periodType: "flexible",
    flexiblePeriod,
    duration,
    travelers: {
      type: selectedTravelerTypes,
      adults,
      children,
      childrenAges: [],
      pets: false
    },
    moods: selectedMoods.length > 0 ? selectedMoods : ["Relax"],
    rhythm,
    activityLevel,
    transport,
    accommodationPreference: "not_sure",
    language: "it"
  };

  try {
    const response = await fetch("/api/trip/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const rawText = await response.text();

    let data: any;

    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(
        `La API non ha restituito JSON. Probabile errore server in /api/trip/generate. Prime righe risposta: ${rawText.slice(0, 200)}`
      );
    }

    if (!response.ok || !data.success) {
      throw new Error(
          data.detail ||
            data.error ||
            "errore durante la generazione"
      );
    }

    router.push(data.redirectUrl);
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : "Errore sconosciuto.");
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div className="rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-2xl shadow-violet-950/10 backdrop-blur-xl md:p-7">
      <div className="mb-6 text-center">
        <p className="text-sm font-bold text-violet-600">Trip Planner AI</p>
        <h2 className="text-2xl font-black">Che viaggio vuoi vivere?</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">Dove vuoi andare?</label>
          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <input
              value={destination}
              disabled={destinationMode === "surprise"}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Es. Toscana, Slovenia, Grecia..."
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-violet-500"
            />
            <button
              type="button"
              onClick={() => setDestinationMode(destinationMode === "surprise" ? "specific" : "surprise")}
              className={`h-12 rounded-2xl border px-5 text-sm font-bold transition ${
                destinationMode === "surprise"
                  ? "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-600"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              Sorprendimi
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Quando parti?</label>
          <input
            value={flexiblePeriod}
            onChange={(event) => setFlexiblePeriod(event.target.value)}
            placeholder="Es. maggio, estate, weekend autunno..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-violet-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Quanto dura?</label>
          <select
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-violet-500"
          >
            {durations.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">Chi parte?</label>
          <div className="flex flex-wrap gap-2">
            {travelerTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedTravelerTypes(toggleValue(selectedTravelerTypes, type))}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  selectedTravelerTypes.includes(type)
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-bold">Adulti</p>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAdults(Math.max(1, adults - 1))}
              className="h-9 w-9 rounded-full border border-slate-200 font-bold"
            >
              -
            </button>
            <span className="text-lg font-black">{adults}</span>
            <button
              type="button"
              onClick={() => setAdults(Math.min(20, adults + 1))}
              className="h-9 w-9 rounded-full border border-slate-200 font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-bold">Bambini</p>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setChildren(Math.max(0, children - 1))}
              className="h-9 w-9 rounded-full border border-slate-200 font-bold"
            >
              -
            </button>
            <span className="text-lg font-black">{children}</span>
            <button
              type="button"
              onClick={() => setChildren(Math.min(20, children + 1))}
              className="h-9 w-9 rounded-full border border-slate-200 font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">Scegli il mood del viaggio</label>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMoods(toggleValue(selectedMoods, mood))}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  selectedMoods.includes(mood)
                    ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Mezzo di trasporto</label>
          <select
            value={transport}
            onChange={(event) => setTransport(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-violet-500"
          >
            {transports.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold">Livello attività</label>
          <select
            value={activityLevel}
            onChange={(event) =>
              setActivityLevel(event.target.value as "comfortable" | "active" | "sporty")
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-violet-500"
          >
            <option value="comfortable">Comodo</option>
            <option value="active">Attivo</option>
            <option value="sporty">Sportivo</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-bold">Ritmo del viaggio</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Lento", value: "slow" },
              { label: "Equilibrato", value: "balanced" },
              { label: "Intenso", value: "intense" }
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRhythm(item.value as "slow" | "balanced" | "intense")}
                className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                  rhythm === item.value
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="button"
        disabled={isLoading}
        onClick={handleSubmit}
        className="mt-6 h-14 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 text-base font-black text-white shadow-xl shadow-fuchsia-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Sto disegnando il tuo viaggio..." : "✨ Genera il mio viaggio"}
      </button>

      <p className="mt-4 text-center text-xs font-medium text-slate-500">
        Riceverai itinerario, mappa, tappe giorno per giorno, budget e idee da vivere.
      </p>
    </div>
  );
}