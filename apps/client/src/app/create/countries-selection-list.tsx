import { Badge } from "@/components/ui/badge";
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
import {
  countries,
  getCountryData,
  getEmojiFlag,
  TCountryCode,
} from "countries-list";
import { Plus, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { FormProvider, useController } from "react-hook-form";
import { z } from "zod";

const countryOptions = Object.entries(countries).map(([code, data]) => ({
  value: code as TCountryCode,
  label: data.name,
  emoji: getEmojiFlag(code as TCountryCode),
}));

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

  const filteredCountries = countryOptions.filter(
    (country) =>
      country.label.toLowerCase().includes(searchValue.toLowerCase()) &&
      !countriesField.value.includes(country.value)
  );
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
  return (
    <div className="flex flex-col gap-2">
      <Label>Countries</Label>
      {countriesField.value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {countriesField.value.map((code: TCountryCode) => {
            let country: Omit<CustomCountrySchema, "imageUrl"> & {
              imageUrl?: string;
            };
            if (code in countries) {
              const regularCountry = getCountryData(code);

              country = {
                name: regularCountry.name,
                code,
                emoji: getEmojiFlag(code),
              };
            } else {
              country = customCountriesField.value[code];
            }

            return (
              <Badge variant="secondary" className="text-sm" key={code}>
                <span>
                  {country.emoji || (
                    <img
                      src={country.imageUrl}
                      alt={country.name}
                      className="w-4 h-4 object-cover inline-block mr-1 align-[-0.2rem]"
                    />
                  )}{" "}
                  {country.name}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-4 rounded-sm p-0"
                  onClick={() => removeCountry(code)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}

      <div className="relative">
        <Input
          placeholder="Search countries..."
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
              className="size-4"
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
