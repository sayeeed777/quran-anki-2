// src/config/translations.ts
export const TRANSLATIONS = [
  {
    id: 'en.sahih',
    name: 'Sahih International',
    translator: 'Sahih International',
    language: 'en'
  },
  {
    id: 'en.arberry',
    name: 'Arberry',
    translator: 'A. J. Arberry',
    language: 'en'
  },
  {
    id: 'en.pickthall',
    name: 'Pickthall',
    translator: 'Marmaduke Pickthall',
    language: 'en'
  },
  {
    id: 'en.yusufali',
    name: 'Yusuf Ali',
    translator: 'Abdullah Yusuf Ali',
    language: 'en'
  },
  {
    id: 'ur.jalandhry',
    name: 'Jalandhry (Urdu)',
    translator: 'Fateh Muhammad Jalandhry',
    language: 'ur'
  }
] as const;

export type TranslationId = typeof TRANSLATIONS[number]['id'];