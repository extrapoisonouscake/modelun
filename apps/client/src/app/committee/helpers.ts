import { FullCommittee } from "@/types/api";
import { getCountryData, getEmojiFlag, TCountryCode } from "countries-list";

export const flattenCountryInfo =
  (customCountries: FullCommittee["customCountries"]) =>
  (countryCode: string) => {
    const isRegularCountry = !customCountries?.[countryCode];
    const data = isRegularCountry
      ? {
          ...getCountryData(countryCode as TCountryCode),
          emoji: getEmojiFlag(countryCode as TCountryCode),
        }
      : customCountries?.[countryCode];
    if (!data) throw new Error("Country not found");
    const imageUrl = isRegularCountry
      ? `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`
      : (data as { imageUrl: string }).imageUrl;
    return { name: data.name, imageUrl, emoji: data.emoji, code: countryCode };
  };
