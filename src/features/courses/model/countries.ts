// ISO 3166-1 alpha-2 codes. The card shows the code ("California, US"), the dropdown shows the name.
export const COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "BS", name: "Bahamas" },
  { code: "BB", name: "Barbados" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "NO", name: "Norway" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [CountryCode, ...CountryCode[]];
