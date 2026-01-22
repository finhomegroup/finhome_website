import { vi } from './locales/vi';
import { en } from './locales/en';

export type Language = 'vi' | 'en';

export const translations = {
  vi,
  en,
} as const;

export type TranslationKey = keyof typeof vi;

// Helper function to get nested translation
export function getNestedTranslation(
  obj: any,
  path: string
): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}
