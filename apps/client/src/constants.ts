import { countries } from "countries-list";

export const COUNTRY_CODES = Object.keys(countries);
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
