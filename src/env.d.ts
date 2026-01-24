/// <reference path="../.astro/types.d.ts" />

// Type declarations for JSON data files
declare module '../data/profiles.json' {
  import type { Profile } from './data/types';
  const profiles: Profile[];
  export default profiles;
}

declare module '../data/links.json' {
  import type { Link } from './data/types';
  const links: Link[];
  export default links;
}

declare module '../data/articles.json' {
  import type { Article } from './data/types';
  const articles: Article[];
  export default articles;
}

declare module '../data/books.json' {
  import type { Book } from './data/types';
  const books: Book[];
  export default books;
}

declare module '../data/slides.json' {
  import type { Slide } from './data/types';
  const slides: Slide[];
  export default slides;
}
