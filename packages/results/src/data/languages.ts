export interface Language {
  code: string
  name: string
}

export type LanguageCode = 'en' | 'hu';

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hu', name: 'Hungarian' }
];

export default languages
