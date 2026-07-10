import { TripPlannerCard } from "@/components/trip-form/trip-planner-card";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f4ff] text-slate-950">
      <section className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#7c8cff_0,transparent_28%),radial-gradient(circle_at_85%_25%,#ff5ba7_0,transparent_24%),radial-gradient(circle_at_70%_80%,#ffd36e_0,transparent_22%)] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-blue-100/40" />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                ✈️
              </div>
              <div className="text-xl font-black leading-tight">
                trip
                <br />
                planner
              </div>
            </div>

            <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight md:text-6xl">
              Il viaggio perfetto non si cerca.{" "}
              <span className="bg-gradient-to-r from-fuchsia-500 to-violet-600 bg-clip-text text-transparent">
                Si genera.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700">
              Inserisci poche informazioni e lascia che la nostra AI crei il tuo itinerario
              su misura con mappa, tappe, esperienze e idee da vivere.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 text-sm md:grid-cols-5">
              {["Mappa", "Itinerario", "Alloggi", "Esperienze", "PDF"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-center font-semibold shadow-sm backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <TripPlannerCard />
        </div>
      </section>
    </main>
  );
}