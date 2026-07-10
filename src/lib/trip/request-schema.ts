import { z } from "zod";

export const tripRequestSchema = z
  .object({
    destinationMode: z.enum(["specific", "surprise"]).default("specific"),
    destination: z.string().trim().max(120).optional().default(""),
    departurePlace: z.string().trim().max(120).optional().default(""),

    periodType: z.enum(["exact_dates", "flexible"]).default("flexible"),
    startDate: z.string().optional().default(""),
    endDate: z.string().optional().default(""),
    flexiblePeriod: z.string().trim().max(120).optional().default(""),

    duration: z
      .enum(["1_day", "weekend", "3_5_days", "1_week", "10_plus_days", "custom"])
      .default("weekend"),
    customDays: z.number().int().min(1).max(30).optional(),

    travelers: z.object({
      type: z.array(z.string()).default([]),
      adults: z.number().int().min(1).max(20).default(2),
      children: z.number().int().min(0).max(20).default(0),
      childrenAges: z.array(z.number().int().min(0).max(17)).optional().default([]),
      pets: z.boolean().default(false),
      petSize: z.enum(["small", "medium", "large"]).optional()
    }),

    moods: z.array(z.string()).min(1).max(8),

    rhythm: z.enum(["slow", "balanced", "intense"]).default("balanced"),
    activityLevel: z.enum(["comfortable", "active", "sporty"]).default("active"),
    transport: z.enum(["car", "train", "flight", "walk_bike", "unknown"]).default("unknown"),

    accommodationPreference: z
      .enum(["hotel", "apartment", "camping", "resort", "not_sure"])
      .optional()
      .default("not_sure"),

    language: z.enum(["it", "en"]).default("it")
  })
  .superRefine((value, ctx) => {
    if (value.destinationMode === "specific" && !value.destination) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Inserisci una destinazione oppure scegli Sorprendimi.",
        path: ["destination"]
      });
    }
  });

export type TripRequest = z.infer<typeof tripRequestSchema>;