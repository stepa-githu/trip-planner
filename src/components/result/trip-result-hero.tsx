import {
  CalendarDays,
  MapPin,
  Route,
  Sparkles,
  WalletCards
} from "lucide-react";

import type { TripAIResult } from "@/lib/ai/schemas/trip-result";

type TripResultHeroProps = {
  result: TripAIResult;
};

export function TripResultHero({
  result
}: TripResultHeroProps) {
  const daysCount = result.days.length;
  const stopsCount = result.map.points.length;

  const startingBudget =
    result.budget.low.amountPerPerson;

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-violet-950/20 md:px-10 md:py-12">
      {/* Elementi decorativi dello sfondo */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-600/50 blur-3xl" />

      <div className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-fuchsia-500/40 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-120px] left-1/3 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_28%)]" />

      <div className="relative z-10">
        {/* Label superiore */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-fuchsia-300" />
            Il tuo viaggio creato con l’AI
          </div>

          <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/70">
            <MapPin className="h-4 w-4" />
            {result.map.centerLabel}
          </div>
        </div>

        {/* Titolo */}
        <div className="mt-8 max-w-4xl">
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            {result.title}
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/80 md:text-xl">
            {result.subtitle}
          </p>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
            {result.overview}
          </p>
        </div>

        {/* Dati sintetici */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroStat
            icon={<CalendarDays className="h-5 w-5" />}
            label="Durata"
            value={`${daysCount} ${
              daysCount === 1 ? "giorno" : "giorni"
            }`}
          />

          <HeroStat
            icon={<Route className="h-5 w-5" />}
            label="Tappe"
            value={`${stopsCount} località`}
          />

          <HeroStat
            icon={<WalletCards className="h-5 w-5" />}
            label="Budget da"
            value={startingBudget}
          />

          <HeroStat
            icon={<Sparkles className="h-5 w-5" />}
            label="Pianificazione"
            value="Su misura"
          />
        </div>

        {/* Perché è adatto */}
        {result.whyThisTripFits.length > 0 ? (
          <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">
              Perché è perfetto per te
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {result.whyThisTripFits
                .slice(0, 4)
                .map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85"
                  >
                    {reason}
                  </span>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function HeroStat({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/15">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-fuchsia-200">
          {icon}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/50">
            {label}
          </p>

          <p className="mt-1 text-base font-black text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}