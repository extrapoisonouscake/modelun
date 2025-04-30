import { countries } from "countries-list";

export const COUNTRY_CODES = Object.keys(countries);
export const DOMAIN_NAME = import.meta.env.VITE_DOMAIN_NAME;
export const ROOT_URL = `https://${DOMAIN_NAME}`;
export const API_URL = DOMAIN_NAME
  ? `${ROOT_URL}/api`
  : "http://localhost:3000";
export const IS_DEV = import.meta.env.DEV;
