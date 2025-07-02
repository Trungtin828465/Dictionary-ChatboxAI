export interface TranslationHistoryItem {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  timestamp: number;
}

export interface LanguageSupport {
  language: string;
  name: string;
}
