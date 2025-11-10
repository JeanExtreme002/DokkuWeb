/**
 * Detects the user's locale based on browser settings
 * Falls back to 'pt-BR' if locale is not supported or detected
 */
export function getSystemLocale(): string {
  try {
    // Try to get locale from browser
    const browserLocale = navigator.language || navigator.languages?.[0];

    if (!browserLocale) {
      return 'en-US'; // Default fallback
    }

    // Check if it's an English locale (US)
    if (browserLocale.startsWith('en')) {
      return 'en-US';
    }

    // Check if it's a Portuguese locale (Brazil)
    if (browserLocale.startsWith('pt')) {
      return 'pt-BR';
    }

    // For other locales, try to use the detected one or fallback to pt-BR
    const supportedLocales = ['pt-BR', 'en-US'];

    // Check if the detected locale is in our supported list
    if (supportedLocales.includes(browserLocale)) {
      return browserLocale;
    }

    // Extract language part and match with supported locales
    const language = browserLocale.split('-')[0];
    const matchedLocale = supportedLocales.find((locale) => locale.startsWith(language));

    return matchedLocale || 'en-US';
  } catch (error) {
    console.warn('Error detecting system locale:', error);
    return 'en-US'; // Safe fallback
  }
}

/**
 * Formats a date using the detected system locale
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = getSystemLocale();
    return dateObj.toLocaleString(locale, options);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Formats a timestamp (Unix timestamp in seconds) using the detected system locale
 */
export function formatTimestamp(timestamp: string | number): string {
  try {
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const date = new Date(timestampNum * 1000);
    return formatDate(date);
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return 'Invalid Date';
  }
}
