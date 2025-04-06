import { countries } from "countries-list";

export const COUNTRY_CODES = Object.keys(countries);
const DOMAIN_NAME = import.meta.env.VITE_DOMAIN_NAME;
export const API_URL = DOMAIN_NAME
  ? `https://api.${import.meta.env.VITE_DOMAIN_NAME}`
  : "http://localhost:3000";
