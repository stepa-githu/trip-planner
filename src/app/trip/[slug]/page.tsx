import { notFound } from "next/navigation";

import type { TripAIResult } from "@/lib/ai/schemas/trip-result";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TripResultHero } from "@/components/result/trip-result-hero";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TripResultPage({ params }: PageProps) {
  const { slug } = await params;

  if (!supabaseAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black">Supabase non configurato</h1>
          <p className="mt-3 text-slate-600">
            Controlla NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file
            .env.local.
          </p>
        </div>
      </main>
    );
  }

  const { data, error } = await supabaseAdmin
    .from("trip_results")
    .select("title, summary, result_json, public_slug, created_at")
    .eq("public_slug", slug)
    .single();

  if (error) {
    console.error("Errore lettura trip_results:", error);
  }

  if (!data) {
    notFound();
  }

  const result = data.result_json as TripAIResult;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <TripResultHero result={result} />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">
              Itinerario giorno per giorno
            </h2>

            <div className="mt-6 space-y-5">
              {result.days.map((day) => (
                <article
                  key={day.day}
                  className="rounded-3xl border border-slate-200 p-5"
                >
                  <h3 className="text-xl font-black">
                    Giorno {day.day} — {day.title}
                  </h3>

                  <div className="mt-4 grid gap-3">
                    {[...day.morning, ...day.afternoon, ...day.evening].map(
                      (activity, index) => (
                        <div
                          key={`${day.day}-${index}`}
                          className="rounded-2xl bg-slate-50 p-4"
                        >
                          <p className="text-xs font-black uppercase tracking-wide text-violet-600">
                            {activity.time}
                          </p>

                          <h4 className="mt-1 font-black">
                            {activity.title}
                          </h4>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {activity.description}
                          </p>

                          <p className="mt-2 text-xs text-slate-500">
                            {activity.locationName}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-blue-50 p-4">
                      <p className="text-sm font-black text-blue-700">
                        Alternativa pioggia
                      </p>
                      <p className="mt-1 text-sm text-blue-950">
                        {day.rainyDayAlternative}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-fuchsia-50 p-4">
                      <p className="text-sm font-black text-fuchsia-700">
                        Alternativa low stress
                      </p>
                      <p className="mt-1 text-sm text-fuchsia-950">
                        {day.lowStressAlternative}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">
                Stima budget per persona
              </h2>

              <div className="mt-4 grid gap-3">
                {Object.entries(result.budget).map(([key, budget]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="text-sm font-black">{budget.label}</p>
                    <p className="mt-1 text-2xl font-black">
                      {budget.amountPerPerson}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {budget.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">Alloggi consigliati</h2>

              <div className="mt-4 space-y-3">
                {result.accommodations.map((item, index) => (
                  <div
                    key={`${item.area}-${index}`}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <p className="font-black">{item.area}</p>
                    <p className="text-sm font-semibold text-violet-700">
                      {item.type}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.why}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">Esperienze</h2>

              <div className="mt-4 space-y-3">
                {result.experiences.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <p className="font-black">{item.title}</p>
                    <p className="text-sm font-semibold text-fuchsia-700">
                      {item.type}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}