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

export interface BookEdition {
  type: 'print' | 'ebook';
  name: string;
  url?: string;
  published?: string;
}

/**
 * Published book information
 */
export interface Book {
  name: string;
  display_name?: string[];
  slug: string;
  description: string;
  published: string;
  size: 'A5';
  pages: number;
  editions: BookEdition[];
}

export interface BookMarket {
  name: string;
  full_name?: string;
  url: string;
  date: string;
  location: string;
}

/**
 * Presentation slide metadata
 */
export interface Slide {
  title: string;
  url: string;
  event: string;
  published: string;
}
