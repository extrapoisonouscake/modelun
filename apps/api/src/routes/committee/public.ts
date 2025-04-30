import { z } from "zod";
import { CHAIR_IDENTIFIER } from "../../constants";
import { votingRecordSchema } from "../../types";
const joinCommitteeBareSchema = z.object({
  code: z.string().regex(/^[0-9]{6}$/),
  passphrase: z.string().optional(),
  countryCode: z.string(),
});
export const joinCommitteeSchema = joinCommitteeBareSchema.refine(
  (data) => {
    return data.passphrase || data.countryCode !== CHAIR_IDENTIFIER;
  },
  {
    message: "Enter passphrase for the dais.",
  }
);
export type JoinCommitteeSchema = z.infer<typeof joinCommitteeSchema>;
export const findCommitteeSchema = joinCommitteeBareSchema.pick({
  code: true,
});
export type FindCommitteeSchema = z.infer<typeof findCommitteeSchema>;
export const voteSchema = votingRecordSchema.pick({
  choice: true,
});
export type VoteSchema = z.infer<typeof voteSchema>;
