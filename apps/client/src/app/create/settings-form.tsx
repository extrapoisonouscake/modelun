import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";

import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useFormValidation } from "@/hooks/use-form-validation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FullCommittee } from "@/types/api";
import { CreateCommitteeSchema } from "@repo/api";
import { z } from "zod";
import { FormPasswordInput } from "../../components/ui/form-password-input";
import { CountriesSelectionList } from "./countries-selection-list";
const lowercaseWords = new Set([
  // Articles
  "a",
  "an",
  "the",
  // Coordinating conjunctions
  "and",
  "or",
  "but",
  "nor",
  "for",
  "yet",
  "so",
  // Short prepositions (3 or fewer letters)
  "at",
  "by",
  "for",
  "in",
  "of",
  "off",
  "on",
  "out",
  "to",
  "up",
  "via",
]);

// Helper function to smartly capitalize text while preserving abbreviations
const smartCapitalize = (text: string): string => {
  return text
    .split(/\s+/)
    .map((word, index) => {
      // Don't modify words that are all uppercase (likely abbreviations)
      if (word === word.toUpperCase()) {
        return word;
      }

      // Keep prepositions/articles lowercase unless they're the first word
      if (index > 0 && lowercaseWords.has(word.toLowerCase())) {
        return word.toLowerCase();
      }

      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

export function CommitteeSettingsForm({
  onSubmit,
  initialValues,
  schema,
  shouldShowPassphraseField = true,
}: {
  onSubmit: (
    data: CreateCommitteeSchema,
    setErrorMessage: (error: string | null) => void
  ) => void;
  initialValues?: FullCommittee;
  schema: z.ZodSchema<any>;
  shouldShowPassphraseField?: boolean;
}) {
  const form = useFormValidation(schema, {
    defaultValues: initialValues,
  });

  const { setErrorMessage, errorMessageNode } = useFormErrorMessage();

  const selectedCountries = form.watch("countries") || [];
  return (
    <Form {...form} onSubmit={(data) => onSubmit(data, setErrorMessage)}>
      {errorMessageNode}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={'For example: "UNSC"'}
                onBlur={(e) => {
                  const capitalized = smartCapitalize(e.target.value);
                  if (capitalized !== e.target.value) {
                    field.onChange(capitalized);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={
                  'For example: "This committee will focus on addressing critical international issues through diplomatic negotiations and consensus building..."'
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <CountriesSelectionList />
      {shouldShowPassphraseField && (
        <FormPasswordInput name="passphrase" label="Passphrase" />
      )}
      <SubmitButton type="submit" disabled={!selectedCountries.length}>
        {initialValues ? "Update" : "Create"}
      </SubmitButton>
    </Form>
  );
}
