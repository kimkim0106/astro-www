/**
 * Type definitions for JSON data files in /src/data/
 */

/**
 * Profile information displayed in the "About me" section
 */
export interface Profile {
  key: string;
  value: string;
}

/**
 * Social media and external platform links
 */
export interface Link {
  name: string;
  url: string;
  account_name: string;
}

/**
 * Blog article metadata
 */
export interface Article {
  title: string;
  url: string;
  published: string;
}

/**
 * Published book information
 */
export type Book = {
  name: string;
  published: string;
  url?: string;
} & (
  | { event_name: string; store_name?: never }
  | { store_name: string; event_name?: never }
);

/**
 * Presentation slide metadata
 */
export interface Slide {
  title: string;
  url: string;
  event: string;
  published: string;
}
