import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useJoinCommittee } from "@/hooks/use-join-committee";
import { trpcClient } from "@/utils/trpc";
import { AppRouterOutput, CHAIR_IDENTIFIER } from "@repo/api";
import { JoinCommitteeSchema, joinCommitteeSchema } from "@repo/api/schemas";

import { FormInput } from "@/components/ui/form-input";
import { getCountryData, getEmojiFlag, TCountryCode } from "countries-list";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { AlphanumericInput } from "./alphanumeric-input";

type LimitedCommittee = AppRouterOutput["committee"]["find"];
export function JoinCommitteeForm() {
  const [committee, setCommittee] = useState<LimitedCommittee>();

  const form = useFormValidation(joinCommitteeSchema);
  const navigate = useNavigate();
  const joinCommittee = useJoinCommittee(navigate);
  async function onSubmit(data: JoinCommitteeSchema) {
    await joinCommittee(data);
  }
  return (
    <Form
      className="flex flex-col gap-2 w-full max-w-[400px] mx-auto"
      {...form}
      onSubmit={onSubmit}
    >
      {committee ? (
        <Confirmation
          committee={committee}
          goBack={() => setCommittee(undefined)}
        />
      ) : (
        <>
          <CommitteeSearch setCommittee={setCommittee} />
          <Link to="/create">
            <Button variant="outline" className="w-full">
              Create Committee
            </Button>
          </Link>
        </>
      )}
    </Form>
  );
}
function CommitteeSearch({
  setCommittee,
}: {
  setCommittee: (committee: LimitedCommittee) => void;
}) {
  const form = useFormContext<JoinCommitteeSchema>();
  const [isLoading, setIsLoading] = useState(false);
  async function findCommittee() {
    const isValid = await form.trigger("code");
    if (!isValid) return;
    setIsLoading(true);
    try {
      const committee = await trpcClient.committee.find.query({
        code: form.getValues("code"),
      });
      setCommittee(committee);
    } catch {}
    setIsLoading(false);
  }
  return (
    <>
      <Label>Enter the code</Label>
      <FormField
        control={form.control}
        name="code"
        render={({ field, formState }) => {
          const errorMessage = formState.errors.code?.message;
          return (
            <>
              <AlphanumericInput
                className="self-center"
                value={field.value}
                onChange={(newValue) => {
                  field.onChange(newValue);
                  if (newValue.length === 6) {
                    findCommittee();
                  }
                }}
              />
              {errorMessage && (
                <p className="text-destructive-foreground text-sm">
                  {errorMessage}
                </p>
              )}
            </>
          );
        }}
      />
      <Button onClick={findCommittee} isLoading={isLoading}>
        Check
      </Button>
    </>
  );
}
function Confirmation({
  committee,
  goBack,
}: {
  committee: LimitedCommittee;
  goBack: () => void;
}) {
  const form = useFormContext();
  const value = form.watch("countryCode");
  return (
    <div className="flex flex-col gap-2">
      <Label>Committee</Label>
      <Label>{committee.name}</Label>
      <CountrySelect
        allowedCountries={committee.countries}
        customCountries={committee.customCountries}
        showChair
      />
      {value === CHAIR_IDENTIFIER && (
        <FormInput
          name="passphrase"
          label="Passphrase"
          type="password"
          placeholder="Enter the passphrase"
        />
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={goBack}>
          Back
        </Button>
        <SubmitButton>Submit</SubmitButton>
      </div>
    </div>
  );
}
export function CountrySelect({
  allowedCountries,
  customCountries = {},
  showChair = false,
}: {
  allowedCountries: LimitedCommittee["countries"];
  customCountries: LimitedCommittee["customCountries"];
  showChair: boolean;
}) {
  const baseOptions = allowedCountries
    .map((data) => {
      let countryData;
      const isRegularCountry = !customCountries?.[data.code];
      if (isRegularCountry) {
        countryData = getCountryData(data.code as TCountryCode);
      } else {
        countryData = customCountries[data.code];
      }
      if (!countryData) return;

      return { ...countryData, ...data, isRegularCountry };
    })
    .filter((item): item is NonNullable<typeof item> => item !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, code, isRegularCountry, isAvailable }) => {
      let leftItem;
      let emoji;
      const customCountryData = customCountries[code];
      if (isRegularCountry) {
        emoji = getEmojiFlag(code as TCountryCode);
      } else if (customCountryData) {
        if ("emoji" in customCountryData) {
          emoji = customCountryData.emoji;
        }
      }
      if (!emoji && !isRegularCountry && customCountryData) {
        leftItem = (
          <img
            src={customCountryData.imageUrl}
            className="size-4 object-cover"
            alt={name}
          />
        );
      }

      return {
        label: `${emoji ? `${emoji} ` : ""}${name}`,
        value: code,
        disabled: !isAvailable,
        leftItem,
      };
    });
  return (
    <FormSelect
      name="countryCode"
      label="Country"
      options={[
        ...baseOptions,
        ...(showChair
          ? [
              {
                label: "🌐 Chair",
                value: CHAIR_IDENTIFIER,
              },
            ]
          : []),
      ]}
    />
  );
}
