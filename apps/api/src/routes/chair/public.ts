import { z } from "zod";
import { committeeSchema } from "../../types/schemas";
export const customCountrySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  imageUrl: z
    .string()
    .min(1)
    .regex(/^https?:\/\//, "Enter a valid URL."),
  emoji: z
    .string()
    .regex(/^\p{Emoji}\u{FE0F}?\u{200D}?(?:\p{Emoji}\u{FE0F}?\u{200D}?)*$/u)
    .optional()
    .or(z.literal("")),
});
export type CustomCountrySchema = z.infer<typeof customCountrySchema>;
export const createCommitteeSchema = committeeSchema
  .pick({
    customCountries: true,
  })
  .extend({
    name: z.string().min(1),
    description: z.string().min(1).optional(),
    passphrase: z.string().min(1),
    countries: z.array(z.string()).min(1),
  });
export type CreateCommitteeSchema = z.infer<typeof createCommitteeSchema>;
export const updateCommitteeSchema = createCommitteeSchema
  .omit({ passphrase: true })
  .partial();
export type UpdateCommitteeSchema = z.infer<typeof updateCommitteeSchema>;
export const createVotingSessionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).optional(),
});
export type CreateVotingSessionSchema = z.infer<
  typeof createVotingSessionSchema
>;
