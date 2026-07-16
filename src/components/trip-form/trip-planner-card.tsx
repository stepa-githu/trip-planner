"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const travelerTypes = [
  "Coppia",
  "Famiglia",
  "Amici",
  "Solo traveller",
  "Over 60"
] as const;

const moods = [
  "Relax",
  "Avventura",
  "Food & Wine",
  "Natura",
  "Cultura",
  "Romantico",
  "Mare",
  "Borghi"
] as const;

const transports = [
  { label: "Auto", value: "car" },
  { label: "Treno", value: "train" },
  { label: "Aereo", value: "flight" },
  { label: "A piedi/bici", value: "walk_bike" },
  { label: "Non so ancora", value: "unknown" }
] as const;

const durations = [
  { label: "1 giorno", value: "1_day" },
  { label: "Weekend", value: "weekend" },
  { label: "3-5 giorni", value: "3_5_days" },
  { label: "1 settimana", value: "1_week" },
  { label: "10+ giorni", value: "10_plus_days" }
] as const;

const rhythms = [
  { label: "Lento", value: "slow" },
  { label: "Equilibrato", value: "balanced" },
  { label: "Intenso", value: "intense" }
] as const;

type DestinationMode = "specific" | "surprise";
type DurationValue = (typeof durations)[number]["value"];
type TransportValue = (typeof transports)[number]["value"];
type RhythmValue = (typeof rhythms)[number]["value"];
type ActivityLevel = "comfortable" | "active" | "sporty";

type GenerateTripResponse = {
  success?: boolean;
  error?: string;
  detail?: string;
  redirectUrl?: string;
};

function toggleValue(values: string[], value: string) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

export function TripPlannerCard() {
  const router = useRouter();

  const [destinationMode, setDestinationMode] =
    useState<DestinationMode>("specific");

  const [destination, setDestination] = useState("");
  const [flexiblePeriod, setFlexiblePeriod] =
    useState("Primavera o estate");

  const [duration, setDuration] =
    useState<DurationValue>("weekend");

  const [selectedTravelerTypes, setSelectedTravelerTypes] =
    useState<string[]>(["Coppia"]);

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [selectedMoods, setSelectedMoods] =
    useState<string[]>(["Relax", "Natura"]);

  const [transport, setTransport] =
    useState<TransportValue>("car");

  const [rhythm, setRhythm] =
    useState<RhythmValue>("balanced");

  const [activityLevel, setActivityLevel] =
    useState<ActivityLevel>("active");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleDestinationModeChange() {
    setDestinationMode((currentMode) => {
      const nextMode =
        currentMode === "surprise" ? "specific" : "surprise";

      if (nextMode === "surprise") {
        setDestination("");
      }

      return nextMode;
    });
  }

  async function handleSubmit() {
    if (
      destinationMode === "specific" &&
      destination.trim().length === 0
    ) {
      setErrorMessage(
        "Inserisci una destinazione oppure seleziona “Sorprendimi”."
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const payload = {
      destinationMode,
      destination:
        destinationMode === "specific"
          ? destination.trim()
          : "",

      departurePlace: "",

      periodType: "flexible" as const,
      flexiblePeriod: flexiblePeriod.trim(),

      duration,

      travelers: {
        type: selectedTravelerTypes,
        adults,
        children,
        childrenAges: [],
        pets: false
      },

      moods:
        selectedMoods.length > 0
          ? selectedMoods
          : ["Relax"],

      rhythm,
      activityLevel,
      transport,

      accommodationPreference: "not_sure" as const,
      language: "it" as const
    };

    try {
      const response = await fetch("/api/trip/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const rawResponse = await response.text();

      if (!rawResponse.trim()) {
        throw new Error(
          `La API ha restituito una risposta vuota. Codice HTTP: ${response.status}.`
        );
      }

      let data: GenerateTripResponse;

      try {
        data = JSON.parse(
          rawResponse
        ) as GenerateTripResponse;
      } catch {
        throw new Error(
          `La API non ha restituito JSON valido. ` +
            `Codice HTTP: ${response.status}. ` +
            `Risposta ricevuta: ${rawResponse.slice(0, 250)}`
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.detail ||
            data.error ||
            `Errore durante la generazione. Codice HTTP: ${response.status}.`
        );
      }

      if (
        !data.redirectUrl ||
        typeof data.redirectUrl !== "string"
      ) {
        throw new Error(
          "Il viaggio è stato generato, ma la API non ha restituito un indirizzo valido."
        );
      }

      router.push(data.redirectUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Si è verificato un errore sconosciuto."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-2xl shadow-violet-950/10 backdrop-blur-xl md:p-7">
      <div className="mb-6 text-center">
        <p className="text-sm font-bold text-violet-600">
          Trip Planner AI
        </p>

        <h2 className="mt-1 text-2xl font-black">
          Che viaggio vuoi vivere?
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Destinazione */}
        <div className="md:col-span-2">
          <label
            htmlFor="destination"
            className="mb-2 block text-sm font-bold"
          >
            Dove vuoi andare?
          </label>

          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <input
              id="destination"
              type="text"
              value={destination}
              disabled={destinationMode === "surprise"}
              onChange={(event) =>
                setDestination(event.target.value)
              }
              placeholder={
                destinationMode === "surprise"
                  ? "Lascia scegliere la destinazione all’AI"
                  : "Es. Slovenia, Toscana, Rimini..."
              }
              className="h-12 min-w-0 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            />

            <button
              type="button"
              aria-pressed={destinationMode === "surprise"}
              onClick={handleDestinationModeChange}
              className={`h-12 rounded-2xl border px-5 text-sm font-bold transition ${
                destinationMode === "surprise"
                  ? "border-fuchsia-400 bg-fuchsia-50 text-fuchsia-600 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-fuchsia-300 hover:bg-fuchsia-50"
              }`}
            >
              ✨ Sorprendimi
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Hai già una meta? Scrivila. Altrimenti lasciati
            sorprendere.
          </p>
        </div>

        {/* Periodo */}
        <div>
          <label
            htmlFor="flexible-period"
            className="mb-2 block text-sm font-bold"
          >
            Quando parti?
          </label>

          <input
            id="flexible-period"
            type="text"
            value={flexiblePeriod}
            onChange={(event) =>
              setFlexiblePeriod(event.target.value)
            }
            placeholder="Es. maggio, estate, weekend autunnale..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500"
          />
        </div>

        {/* Durata */}
        <div>
          <label
            htmlFor="duration"
            className="mb-2 block text-sm font-bold"
          >
            Quanto dura?
          </label>

          <select
            id="duration"
            value={duration}
            onChange={(event) =>
              setDuration(
                event.target.value as DurationValue
              )
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-violet-500"
          >
            {durations.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo di viaggiatori */}
        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-bold">
            Chi parte?
          </p>

          <div className="flex flex-wrap gap-2">
            {travelerTypes.map((type) => {
              const isSelected =
                selectedTravelerTypes.includes(type);

              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelectedTravelerTypes(
                      toggleValue(
                        selectedTravelerTypes,
                        type
                      )
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    isSelected
                      ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contatori compatti */}
        <div className="md:col-span-2">
          <div className="grid max-w-sm grid-cols-2 gap-3">
            <TravelerCounter
              label="Adulti"
              value={adults}
              minimum={1}
              maximum={20}
              onChange={setAdults}
            />

            <TravelerCounter
              label="Bambini"
              value={children}
              minimum={0}
              maximum={20}
              onChange={setChildren}
            />
          </div>
        </div>

        {/* Mood */}
        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-bold">
            Scegli il mood del viaggio
          </p>

          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => {
              const isSelected =
                selectedMoods.includes(mood);

              return (
                <button
                  key={mood}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelectedMoods(
                      toggleValue(
                        selectedMoods,
                        mood
                      )
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    isSelected
                      ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-fuchsia-300 hover:bg-fuchsia-50"
                  }`}
                >
                  {mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trasporto */}
        <div>
          <label
            htmlFor="transport"
            className="mb-2 block text-sm font-bold"
          >
            Mezzo di trasporto
          </label>

          <select
            id="transport"
            value={transport}
            onChange={(event) =>
              setTransport(
                event.target.value as TransportValue
              )
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-violet-500"
          >
            {transports.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Attività */}
        <div>
          <label
            htmlFor="activity-level"
            className="mb-2 block text-sm font-bold"
          >
            Livello attività
          </label>

          <select
            id="activity-level"
            value={activityLevel}
            onChange={(event) =>
              setActivityLevel(
                event.target.value as ActivityLevel
              )
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-violet-500"
          >
            <option value="comfortable">
              Comodo
            </option>

            <option value="active">
              Attivo
            </option>

            <option value="sporty">
              Sportivo
            </option>
          </select>
        </div>

        {/* Ritmo */}
        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-bold">
            Ritmo del viaggio
          </p>

          <div className="grid grid-cols-3 gap-2">
            {rhythms.map((item) => {
              const isSelected =
                rhythm === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setRhythm(item.value)
                  }
                  className={`rounded-2xl border px-2 py-3 text-xs font-bold transition sm:px-3 sm:text-sm ${
                    isSelected
                      ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Errore */}
      {errorMessage ? (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      {/* CTA */}
      <button
        type="button"
        disabled={isLoading}
        onClick={handleSubmit}
        className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 text-base font-black text-white shadow-xl shadow-fuchsia-500/20 transition hover:scale-[1.01] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
      >
        {isLoading
          ? "Sto disegnando il tuo viaggio..."
          : "✨ Genera il mio viaggio"}
      </button>

      <p className="mt-4 text-center text-xs font-medium leading-5 text-slate-500">
        Riceverai itinerario, mappa, tappe giorno per
        giorno, budget e idee da vivere.
      </p>
    </div>
  );
}

function TravelerCounter({
  label,
  value,
  minimum,
  maximum,
  onChange
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  onChange: (value: number) => void;
}) {
  const canDecrease = value > minimum;
  const canIncrease = value < maximum;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={`Riduci ${label.toLowerCase()}`}
          disabled={!canDecrease}
          onClick={() =>
            onChange(
              Math.max(minimum, value - 1)
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm font-black text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>

        <span className="min-w-6 text-center text-base font-black text-slate-950">
          {value}
        </span>

        <button
          type="button"
          aria-label={`Aumenta ${label.toLowerCase()}`}
          disabled={!canIncrease}
          onClick={() =>
            onChange(
              Math.min(maximum, value + 1)
            )
          }
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-sm font-black text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}