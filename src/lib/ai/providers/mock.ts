import type {
  AIGeneration,
  AIProvider,
  PromptConfiguration
} from "@/lib/ai/types";
import type { TripRequest } from "@/lib/trip/request-schema";

export class MockTripProvider implements AIProvider {
  async generateTrip(
    input: TripRequest,
    prompt: PromptConfiguration
  ): Promise<AIGeneration> {
    const destination =
      input.destinationMode === "surprise"
        ? "una destinazione a sorpresa in Italia"
        : input.destination || "Italia";

    return {
      provider: "mock",
      model: "mock-v0",

      promptId: prompt.promptId,
      promptVersion: prompt.promptVersion,

      usage: {
        inputTokens: 0,
        outputTokens: 0
      },

      result: {
        title: `La tua avventura a ${destination}`,

        subtitle:
          "Un itinerario AI su misura per testare Trip Planner senza consumare crediti API.",

        overview:
          "Questo è un risultato mock: serve per sviluppare e verificare interfaccia, database, prompt e flusso di generazione senza chiamare un provider AI reale.",

        whyThisTripFits: [
          "Rispetta il mood selezionato.",
          "Bilancia tappe, pause e consigli pratici.",
          "È pensato per essere visualizzato come una pagina viaggio completa."
        ],

        map: {
          centerLabel: destination,
          points: [
            {
              day: 1,
              title: "Arrivo e prima esplorazione",
              locationName: destination,
              latitude: null,
              longitude: null,
              description:
                "Prima tappa del viaggio con passeggiata introduttiva e orientamento nella destinazione."
            },
            {
              day: 2,
              title: "Esperienze principali",
              locationName: destination,
              latitude: null,
              longitude: null,
              description:
                "Giornata dedicata alle attività più coerenti con il mood scelto."
            }
          ]
        },

        days: [
          {
            day: 1,
            title: "Arrivo e atmosfera locale",

            morning: [
              {
                time: "10:00",
                title: "Arrivo e sistemazione",
                description:
                  "Arriva con calma, lascia i bagagli e prendi confidenza con la zona.",
                locationName: destination
              }
            ],

            afternoon: [
              {
                time: "15:00",
                title: "Passeggiata panoramica",
                description:
                  "Prima esplorazione leggera per entrare nel mood del viaggio.",
                locationName: destination
              }
            ],

            evening: [
              {
                time: "20:00",
                title: "Cena tipica",
                description:
                  "Scegli un locale in zona centrale o in un quartiere caratteristico.",
                locationName: destination
              }
            ],

            foodTips: [
              "Prova un piatto tipico locale.",
              "Scegli una zona comoda per il rientro."
            ],

            rainyDayAlternative:
              "Visita un museo, un mercato coperto o una spa.",

            lowStressAlternative:
              "Riduci gli spostamenti e resta nella zona dell’alloggio."
          },

          {
            day: 2,
            title: "Giornata esperienziale",

            morning: [
              {
                time: "09:30",
                title: "Tappa culturale o naturale",
                description:
                  "Dedica la mattina alla tappa più importante della destinazione.",
                locationName: destination
              }
            ],

            afternoon: [
              {
                time: "14:30",
                title: "Esperienza locale",
                description:
                  "Aggiungi un’attività coerente con interessi e ritmo scelti.",
                locationName: destination
              }
            ],

            evening: [
              {
                time: "19:30",
                title: "Aperitivo o cena con vista",
                description:
                  "Chiudi la giornata con un momento memorabile.",
                locationName: destination
              }
            ],

            foodTips: [
              "Prenota se viaggi nel weekend.",
              "Mantieni una pausa libera nel pomeriggio."
            ],

            rainyDayAlternative:
              "Sposta le attività all’aperto alla mattina successiva.",

            lowStressAlternative:
              "Scegli una sola attività principale e lascia tempo libero."
          }
        ],

        budget: {
          low: {
            label: "Budget low",
            amountPerPerson: "da €420",
            description:
              "Soluzioni smart, trasporti comodi e attività gratuite o economiche."
          },

          medium: {
            label: "Budget medium",
            amountPerPerson: "da €720",
            description:
              "Buon equilibrio tra comfort, posizione e qualità delle esperienze."
          },

          top: {
            label: "Budget top",
            amountPerPerson: "da €1.250",
            description:
              "Massimo comfort, alloggi centrali ed esperienze premium."
          }
        },

        accommodations: [
          {
            area: "Zona centrale",
            type: "Hotel o appartamento",
            why:
              "Comoda per ridurre gli spostamenti e vivere meglio la destinazione.",
            searchHint: `Alloggi centrali ${destination}`
          },

          {
            area: "Zona tranquilla",
            type: "Boutique hotel o B&B",
            why:
              "Ideale per un viaggio più rilassato e meno turistico.",
            searchHint: `B&B tranquillo ${destination}`
          }
        ],

        experiences: [
          {
            title: "Tour introduttivo",
            type: "Cultura",
            description:
              "Perfetto per capire storia, quartieri e punti principali.",
            searchHint: `Tour guidato ${destination}`
          },

          {
            title: "Esperienza food locale",
            type: "Food & Wine",
            description:
              "Degustazione, corso di cucina o visita a produttori locali.",
            searchHint: `Esperienza gastronomica ${destination}`
          }
        ],

        practicalTips: [
          "Controlla sempre orari aggiornati prima di partire.",
          "Prenota le attività più richieste con anticipo.",
          "Mantieni margine tra una tappa e l’altra."
        ],

        whatToBookInAdvance: [
          "Alloggio",
          "Esperienze principali",
          "Eventuali ingressi a musei"
        ],

        whatToPack: [
          "Scarpe comode",
          "Power bank",
          "Abbigliamento a strati"
        ],

        mistakesToAvoid: [
          "Programmare troppe tappe nello stesso giorno.",
          "Sottovalutare i tempi di spostamento.",
          "Non prevedere alternative in caso di pioggia."
        ],

        shareSummary:
          `Itinerario personalizzato a ${destination}, creato con Trip Planner AI.`
      }
    };
  }
}