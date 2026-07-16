"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CloudRain,
  Coffee,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  Utensils
} from "lucide-react";

import type { TripAIResult } from "@/lib/ai/schemas/trip-result";

type TripDay = TripAIResult["days"][number];

type TripDayExplorerProps = {
  days: TripDay[];
};

export function TripDayExplorer({ days }: TripDayExplorerProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [showRainyAlternative, setShowRainyAlternative] = useState(false);
  const [showLowStressAlternative, setShowLowStressAlternative] = useState(false);

  const activeDay = days[activeDayIndex];

  const totalActivities = useMemo(() => {
    if (!activeDay) {
      return 0;
    }

    return (
      activeDay.morning.length +
      activeDay.afternoon.length +
      activeDay.evening.length
    );
  }, [activeDay]);

  function selectDay(index: number) {
    setActiveDayIndex(index);
    setShowRainyAlternative(false);
    setShowLowStressAlternative(false);
  }

  function goToPreviousDay() {
    if (activeDayIndex > 0) {
      selectDay(activeDayIndex - 1);
    }
  }

  function goToNextDay() {
    if (activeDayIndex < days.length - 1) {
      selectDay(activeDayIndex + 1);
    }
  }

  if (!activeDay || days.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Nessuna giornata disponibile.
        </p>
      </section>
    );
  }

  const progressPercentage = ((activeDayIndex + 1) / days.length) * 100;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-5 md:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-violet-600">
              <CalendarDays className="h-4 w-4" />
              Itinerario giorno per giorno
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
              Esplora il tuo viaggio
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Seleziona una giornata e scopri il programma completo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goToPreviousDay}
              disabled={activeDayIndex === 0}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Giorno precedente"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="min-w-28 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Giorno
              </p>
              <p className="text-lg font-black">
                {activeDayIndex + 1} di {days.length}
              </p>
            </div>

            <button
              type="button"
              onClick={goToNextDay}
              disabled={activeDayIndex === days.length - 1}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Giorno successivo"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-blue-500 transition-all duration-500"
            style={{
              width: `${progressPercentage}%`
            }}
          />
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {days.map((day, index) => {
            const isActive = index === activeDayIndex;

            return (
              <button
                key={`${day.day}-${day.title}`}
                type="button"
                onClick={() => selectDay(index)}
                className={`min-w-[150px] rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-violet-500 bg-violet-50 shadow-sm shadow-violet-200"
                    : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50"
                }`}
              >
                <p
                  className={`text-xs font-black uppercase tracking-wide ${
                    isActive ? "text-violet-600" : "text-slate-400"
                  }`}
                >
                  Giorno {day.day}
                </p>

                <p className="mt-1 line-clamp-2 text-sm font-black text-slate-900">
                  {day.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={activeDay.day}
        className="animate-[fadeIn_.35s_ease-out] p-5 md:p-7"
      >
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-900 p-6 text-white md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-white/80">
                Giorno {activeDay.day}
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/70">
                {totalActivities} attività
              </span>
            </div>

            <h3 className="mt-5 max-w-3xl text-3xl font-black tracking-tight md:text-4xl">
              {activeDay.title}
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Una giornata costruita per bilanciare scoperta, pause e momenti da ricordare.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          <DayMoment
            title="Mattina"
            icon={<Sun className="h-5 w-5" />}
            activities={activeDay.morning}
            emptyText="Mattina libera"
          />

          <DayMoment
            title="Pomeriggio"
            icon={<Coffee className="h-5 w-5" />}
            activities={activeDay.afternoon}
            emptyText="Pomeriggio libero"
          />

          <DayMoment
            title="Sera"
            icon={<Moon className="h-5 w-5" />}
            activities={activeDay.evening}
            emptyText="Serata libera"
          />
        </div>

        {activeDay.foodTips.length > 0 ? (
          <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 text-sm font-black text-amber-800">
              <Utensils className="h-5 w-5" />
              Consigli food
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {activeDay.foodTips.map((tip) => (
                <span
                  key={tip}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-950 shadow-sm"
                >
                  {tip}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <AlternativeCard
            icon={<CloudRain className="h-5 w-5" />}
            label="Se piove"
            title="Alternativa indoor"
            description={activeDay.rainyDayAlternative}
            isOpen={showRainyAlternative}
            onToggle={() =>
              setShowRainyAlternative((current) => !current)
            }
          />

          <AlternativeCard
            icon={<Sparkles className="h-5 w-5" />}
            label="Meno stress"
            title="Versione più rilassante"
            description={activeDay.lowStressAlternative}
            isOpen={showLowStressAlternative}
            onToggle={() =>
              setShowLowStressAlternative((current) => !current)
            }
          />
        </div>
      </div>
    </section>
  );
}

function DayMoment({
  title,
  icon,
  activities,
  emptyText
}: {
  title: string;
  icon: React.ReactNode;
  activities: TripDay["morning"];
  emptyText: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
          {icon}
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
            Momento
          </p>
          <h4 className="text-lg font-black text-slate-900">{title}</h4>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <article
              key={`${activity.time}-${activity.title}-${index}`}
              className="relative rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="absolute bottom-4 left-0 top-4 w-1 rounded-r-full bg-gradient-to-b from-fuchsia-500 to-violet-600" />

              <div className="pl-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wide text-violet-600">
                    {activity.time}
                  </p>

                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {activity.locationName}
                  </div>
                </div>

                <h5 className="mt-2 text-base font-black text-slate-950">
                  {activity.title}
                </h5>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {activity.description}
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}

function AlternativeCard({
  icon,
  label,
  title,
  description,
  isOpen,
  onToggle
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            {icon}
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="font-black text-slate-950">{title}</p>
          </div>
        </div>

        <span
          className={`text-xl font-light text-slate-400 transition ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          <p className="text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      ) : null}
    </div>
  );
}