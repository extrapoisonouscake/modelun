import { flattenCountryInfo as flattenCountryInfoFn } from "@/app/committee/helpers";
import { CountryBadge } from "@/components/misc/country-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormInput } from "@/components/ui/form-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormValidation } from "@/hooks/use-form-validation";
import { cn } from "@/lib/utils";
import { CustomCountrySchema, customCountrySchema } from "@repo/api";
import { countries, getEmojiFlag, TCountryCode } from "countries-list";
import { Plus, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { FormProvider, useController } from "react-hook-form";
import { z } from "zod";

export const countryOptions = Object.entries(countries).map(([code, data]) => ({
  value: code as TCountryCode,
  label: data.name,
  emoji: getEmojiFlag(code as TCountryCode),
}));

// Add country nicknames and common aliases
const countryNicknames: Record<string, string[]> = {
  US: [
    "america",
    "usa",
    "united states of america",
    "states",
    "u.s.",
    "u.s.a.",
  ],
  GB: ["britain", "england", "uk", "united kingdom", "great britain"],
  RU: ["russia", "russian federation"],
  CN: ["china", "peoples republic of china", "prc"],
  KR: ["south korea", "korea"],
  KP: ["north korea", "dprk", "democratic peoples republic of korea"],
  DE: ["germany", "deutschland"],
  FR: ["france", "french republic"],
  IT: ["italy", "italian republic"],
  ES: ["spain", "kingdom of spain"],
  NL: ["netherlands", "holland", "dutch"],
  CH: ["switzerland", "swiss confederation"],
  SE: ["sweden", "kingdom of sweden"],
  NO: ["norway", "kingdom of norway"],
  DK: ["denmark", "kingdom of denmark"],
  FI: ["finland", "republic of finland"],
  IE: ["ireland", "republic of ireland"],
  AU: ["australia", "commonwealth of australia"],
  NZ: ["new zealand", "aotearoa"],
  CA: ["canada", "great white north"],
  MX: ["mexico", "united mexican states"],
  BR: ["brazil", "brasil"],
  AR: ["argentina", "argentine republic"],
  ZA: ["south africa", "rsa"],
  EG: ["egypt", "arab republic of egypt"],
  IN: ["india", "bharat"],
  JP: ["japan", "nippon", "nihon"],
  CD: ["congo", "democratic republic of the congo", "drc"],
};

export function CountriesSelectionList() {
  const { field: countriesField } = useController({
    name: "countries",
    defaultValue: [],
  });
  const { field: customCountriesField } = useController({
    name: "customCountries",
    defaultValue: {},
  });
  const [searchValue, setSearchValue] = useState("");

  const [customCountryModalOpen, setCustomCountryModalOpen] = useState(false);
  const customCountryModalRef = useRef<{
    initializeForm: (value: string) => void;
  }>(null);

  const removeCountry = (countryToRemove: string) => {
    countriesField.onChange(
      countriesField.value.filter(
        (country: string) => country !== countryToRemove
      )
    );
    const isCustomCountry = countryToRemove in customCountriesField.value;
    if (isCustomCountry) {
      const newValue = { ...customCountriesField.value };
      delete newValue[countryToRemove];
      customCountriesField.onChange(newValue);
    }
  };

  const addCountry = (externalCountryCode?: string) => {
    const hoveredCountry = filteredCountries[hoveredCountryIndex];
    if (externalCountryCode || targetCountry || hoveredCountry) {
      const countryCode =
        externalCountryCode || hoveredCountry?.value || targetCountry?.value;
      if (!countriesField.value.includes(countryCode)) {
        countriesField.onChange([...countriesField.value, countryCode]);
        setSearchValue("");
      }
      if (hoveredCountry) {
        setHoveredCountryIndex(0);
      }
    } else {
      handleOpenModal();
    }
  };

  const filteredCountries = countryOptions
    .map((country) => {
      const lowerCaseSearchValue = searchValue.toLowerCase();
      const lowerCaseLabel = country.label.toLowerCase();

      // Split search terms into words and filter out common words
      const searchTerms = lowerCaseSearchValue
        .split(/\s+/)
        .filter((term) => !["the", "of", "and", "in", "to"].includes(term));

      // If no meaningful search terms after filtering, return score 0
      if (searchTerms.length === 0) {
        return { country, score: 0 };
      }

      let score = 0;

      // Check for exact match first
      if (lowerCaseLabel === lowerCaseSearchValue) {
        score += 100;
      }

      // Check for exact phrase match
      if (lowerCaseLabel.includes(lowerCaseSearchValue)) {
        score += 50;
      }

      // Check nicknames
      const nicknames = countryNicknames[country.value] || [];
      if (
        nicknames.some(
          (nickname) => nickname.toLowerCase() === lowerCaseSearchValue
        )
      ) {
        score += 80; // High score for exact nickname match
      }
      if (
        nicknames.some((nickname) =>
          nickname.toLowerCase().includes(lowerCaseSearchValue)
        )
      ) {
        score += 40; // Good score for partial nickname match
      }

      // Check for individual term matches
      searchTerms.forEach((term, index) => {
        if (lowerCaseLabel.includes(term)) {
          // Terms at the start of the search get higher weight
          const positionWeight = 1 - (index / searchTerms.length) * 0.5;
          score += 20 * positionWeight;

          // If the term is at the start of a word in the country name
          if (
            lowerCaseLabel.split(/\s+/).some((word) => word.startsWith(term))
          ) {
            score += 10;
          }
        }

        // Check if term matches any nickname
        if (
          nicknames.some((nickname) => nickname.toLowerCase().includes(term))
        ) {
          score += 15; // Additional points for matching nickname terms
        }
      });

      return { country, score };
    })
    .filter(
      ({ country, score }) =>
        score > 0 && !countriesField.value.includes(country.value)
    )
    .sort((a, b) => b.score - a.score)
    .map(({ country }) => country);
  const addCustomCountry = (country: CustomCountrySchema) => {
    customCountriesField.onChange({
      ...customCountriesField.value,
      [country.code]: country,
    });
  };
  const targetCountry = filteredCountries[0];

  const handleOpenModal = () => {
    setCustomCountryModalOpen(true);
    customCountryModalRef.current?.initializeForm(searchValue);
  };

  const [hoveredCountryIndex, setHoveredCountryIndex] = useState<number>(0);
  const flattenCountryInfo = flattenCountryInfoFn(customCountriesField.value);
  return (
    <div className="flex flex-col gap-2">
      <Label>Delegates</Label>
      {countriesField.value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {countriesField.value.map((countryCode: TCountryCode) => {
            const country = flattenCountryInfo(countryCode);
            return (
              <CountryBadge
                country={country}
                rightElement={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-4 rounded-sm p-0"
                    onClick={() => removeCountry(country.code)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                }
              />
            );
          })}
        </div>
      )}

      <div className="relative">
        <Input
          placeholder="Start typing..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (!searchValue) return;
            if (e.key === "Enter") {
              e.preventDefault();
              addCountry();
            } else if (e.key === "ArrowDown") {
              setHoveredCountryIndex((hoveredCountryIndex) => {
                if (hoveredCountryIndex === null) return 0;
                return hoveredCountryIndex + 1;
              });
            } else if (e.key === "ArrowUp") {
              setHoveredCountryIndex((hoveredCountryIndex) => {
                if (hoveredCountryIndex === null) return 0;
                return hoveredCountryIndex - 1;
              });
            }
          }}
          rightIcon={
            <Plus
              onClick={() => {
                if (!searchValue) return;
                handleOpenModal();
              }}
              data-disabled={!searchValue}
              className="size-4 opacity-100 cursor-pointer data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 transition-all duration-200"
            />
          }
        />

        {searchValue && filteredCountries.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
            {filteredCountries.map((country, i) => (
              <div
                key={country.value}
                className={cn("cursor-pointer px-4 py-2", {
                  "bg-gray-100": hoveredCountryIndex === i,
                })}
                onMouseEnter={() => setHoveredCountryIndex(i)}
                onMouseLeave={() =>
                  setTimeout(() => {
                    if (hoveredCountryIndex === i) {
                      setHoveredCountryIndex(0);
                    }
                  }, 0)
                }
                onClick={() => addCountry(country.value)}
              >
                <span className="mr-2">{country.emoji}</span>
                {country.label}
              </div>
            ))}
          </div>
        )}
      </div>
      <CustomCountryModal
        open={customCountryModalOpen}
        setOpen={setCustomCountryModalOpen}
        ref={customCountryModalRef}
        onAdd={(data) => {
          addCountry(data.code);
          addCustomCountry(data);
        }}
      />
    </div>
  );
}

const CustomCountryModal = forwardRef<
  { initializeForm: (value: string) => void },
  {
    open: boolean;
    setOpen: (open: boolean) => void;
    onAdd: (data: z.infer<typeof customCountrySchema>) => void;
  }
>(({ open, setOpen, onAdd }, ref) => {
  const form = useFormValidation(customCountrySchema);

  useImperativeHandle(ref, () => ({
    initializeForm: (value: string) => {
      form.setValue("name", value);
    },
  }));

  const handleSubmit = (data: z.infer<typeof customCountrySchema>) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );
    onAdd(cleanedData as z.infer<typeof customCountrySchema>);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Country</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <div className="flex flex-col gap-3">
            <FormInput name="name" label="Name" />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      maxLength={4}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormInput name="imageUrl" label="Image URL" />
            <FormInput name="emoji" label="Emoji (optional)" />
            <SubmitButton onClick={() => handleSubmit(form.getValues())}>
              Add
            </SubmitButton>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
});
