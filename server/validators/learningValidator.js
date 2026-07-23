import { z } from 'zod';

export const createLearningSchema = z.object({
  body: z.object({
    topic: z.string({
      required_error: "Topic is required",
    }).min(1, "Topic cannot be empty"),
    description: z.string().optional(),
  }),
});

export const updateLearningSchema = z.object({
  body: z.object({
    topic: z.string({
      required_error: "Topic is required",
    }).min(1, "Topic cannot be empty"),
    description: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});

export const reviewLearningSchema = z.object({
  body: z.object({
    difficulty: z.enum(['hard', 'good', 'easy'], {
      required_error: "Difficulty is required",
      invalid_type_error: "Difficulty must be one of: 'hard', 'good', 'easy'",
    }),
  }),
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
});
