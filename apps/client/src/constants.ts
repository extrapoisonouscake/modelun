import { countries } from "countries-list";

export const COUNTRY_CODES = Object.keys(countries);
export const API_URL =
  `https://api.${process.env.VITE_DOMAIN_NAME}` || "http://localhost:3000";
