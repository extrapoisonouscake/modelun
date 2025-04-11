import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { SubmitButton } from "@/components/ui/submit-button";

import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useFormValidation } from "@/hooks/use-form-validation";

import { Textarea } from "@/components/ui/textarea";
import { FullCommittee } from "@/types/api";
import { CreateCommitteeSchema } from "@repo/api";
import { z } from "zod";
import { FormPasswordInput } from "../../components/ui/form-password-input";
import { CountriesSelectionList } from "./countries-selection-list";
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
    <Form
      {...form}
      onSubmit={(data) => onSubmit(data, setErrorMessage)}
    >
      {errorMessageNode}
      <FormInput name="name" label="Name" />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
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
