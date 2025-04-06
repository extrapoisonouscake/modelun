import { countries } from "countries-list";

export const PORT = +(process.env.PORT || 3000);
export const isDev = process.env.NODE_ENV === "development";
export const isProd = process.env.NODE_ENV === "production";
export const CHAIR_IDENTIFIER = "CHAIR";
export const COUNTRY_CODES = Object.keys(countries);

const DOMAIN_NAME = process.env.DOMAIN_NAME;
if (isProd && !DOMAIN_NAME) {
  throw new Error("DOMAIN_NAME is not set");
}
export const CLIENT_ORIGIN =
  `https://${DOMAIN_NAME}` || "http://localhost:3001";
