import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { useJoinCommittee } from "@/hooks/use-join-committee";
import { trpcClient } from "@/utils/trpc";
import { AppRouterOutput, CHAIR_IDENTIFIER } from "@repo/api";
import { JoinCommitteeSchema, joinCommitteeSchema } from "@repo/api/schemas";

import { FormInput } from "@/components/ui/form-input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { getCountryData, getEmojiFlag, TCountryCode } from "countries-list";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";

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
              Need to create a committee?
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
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");
  useEffect(() => {
    if (code) {
      form.setValue("code", code);
      findCommittee();
      setSearchParams({});
    }
  }, [code]);
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
    <div className="flex flex-col gap-4">
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem className="self-center">
            <FormLabel>Committee Code</FormLabel>
            <FormControl>
              <InputOTP
                maxLength={6}
                pattern="^[0-9]+$"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    findCommittee();
                  }
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button onClick={findCommittee} isLoading={isLoading}>
        Check
      </Button>
    </div>
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
      <h2 className="text-xl font-bold">{committee.name}</h2>
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
      <div className="flex flex-col gap-2">
        <SubmitButton>Submit</SubmitButton>
        <Button variant="outline" onClick={goBack}>
          Back
        </Button>
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
      placeholder="Click to select..."
      options={[
        ...baseOptions,
        ...(showChair
          ? [
              {
                label: "🧑‍⚖️ Dais",
                value: CHAIR_IDENTIFIER,
              },
            ]
          : []),
      ]}
    />
  );
}
