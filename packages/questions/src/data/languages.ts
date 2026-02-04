export interface Language {
  code: LanguageCode
  name: string;
}

export type LanguageCode =
  | "en"
  | "hu";

const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "hu", name: "Hungarian" }
];

export default languages;
