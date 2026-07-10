import { z } from "zod";

const activitySchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string(),
  locationName: z.string()
});

const budgetOptionSchema = z.object({
  label: z.string(),
  amountPerPerson: z.string(),
  description: z.string()
});

export const tripAIResultSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  overview: z.string(),

  whyThisTripFits: z.array(z.string()),

  map: z.object({
    centerLabel: z.string(),
    points: z.array(
      z.object({
        day: z.number(),
        title: z.string(),
        locationName: z.string(),
        latitude: z.number().nullable(),
        longitude: z.number().nullable(),
        description: z.string()
      })
    )
  }),

  days: z.array(
    z.object({
      day: z.number(),
      title: z.string(),
      morning: z.array(activitySchema),
      afternoon: z.array(activitySchema),
      evening: z.array(activitySchema),
      foodTips: z.array(z.string()),
      rainyDayAlternative: z.string(),
      lowStressAlternative: z.string()
    })
  ),

  budget: z.object({
    low: budgetOptionSchema,
    medium: budgetOptionSchema,
    top: budgetOptionSchema
  }),

  accommodations: z.array(
    z.object({
      area: z.string(),
      type: z.string(),
      why: z.string(),
      searchHint: z.string()
    })
  ),

  experiences: z.array(
    z.object({
      title: z.string(),
      type: z.string(),
      description: z.string(),
      searchHint: z.string()
    })
  ),

  practicalTips: z.array(z.string()),
  whatToBookInAdvance: z.array(z.string()),
  whatToPack: z.array(z.string()),
  mistakesToAvoid: z.array(z.string()),

  shareSummary: z.string()
});

export type TripAIResult = z.infer<typeof tripAIResultSchema>;

const stringArrayJsonSchema = {
  type: "array",
  items: {
    type: "string"
  }
} as const;

const activityJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    time: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    locationName: { type: "string" }
  },
  required: ["time", "title", "description", "locationName"]
} as const;

const budgetOptionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    label: { type: "string" },
    amountPerPerson: { type: "string" },
    description: { type: "string" }
  },
  required: ["label", "amountPerPerson", "description"]
} as const;

export const tripAIResultJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    overview: { type: "string" },

    whyThisTripFits: stringArrayJsonSchema,

    map: {
      type: "object",
      additionalProperties: false,
      properties: {
        centerLabel: { type: "string" },
        points: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              day: { type: "number" },
              title: { type: "string" },
              locationName: { type: "string" },
              latitude: { type: ["number", "null"] },
              longitude: { type: ["number", "null"] },
              description: { type: "string" }
            },
            required: ["day", "title", "locationName", "latitude", "longitude", "description"]
          }
        }
      },
      required: ["centerLabel", "points"]
    },

    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          day: { type: "number" },
          title: { type: "string" },
          morning: {
            type: "array",
            items: activityJsonSchema
          },
          afternoon: {
            type: "array",
            items: activityJsonSchema
          },
          evening: {
            type: "array",
            items: activityJsonSchema
          },
          foodTips: stringArrayJsonSchema,
          rainyDayAlternative: { type: "string" },
          lowStressAlternative: { type: "string" }
        },
        required: [
          "day",
          "title",
          "morning",
          "afternoon",
          "evening",
          "foodTips",
          "rainyDayAlternative",
          "lowStressAlternative"
        ]
      }
    },

    budget: {
      type: "object",
      additionalProperties: false,
      properties: {
        low: budgetOptionJsonSchema,
        medium: budgetOptionJsonSchema,
        top: budgetOptionJsonSchema
      },
      required: ["low", "medium", "top"]
    },

    accommodations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          area: { type: "string" },
          type: { type: "string" },
          why: { type: "string" },
          searchHint: { type: "string" }
        },
        required: ["area", "type", "why", "searchHint"]
      }
    },

    experiences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          type: { type: "string" },
          description: { type: "string" },
          searchHint: { type: "string" }
        },
        required: ["title", "type", "description", "searchHint"]
      }
    },

    practicalTips: stringArrayJsonSchema,
    whatToBookInAdvance: stringArrayJsonSchema,
    whatToPack: stringArrayJsonSchema,
    mistakesToAvoid: stringArrayJsonSchema,

    shareSummary: { type: "string" }
  },
  required: [
    "title",
    "subtitle",
    "overview",
    "whyThisTripFits",
    "map",
    "days",
    "budget",
    "accommodations",
    "experiences",
    "practicalTips",
    "whatToBookInAdvance",
    "whatToPack",
    "mistakesToAvoid",
    "shareSummary"
  ]
} as const;