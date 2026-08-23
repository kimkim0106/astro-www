import profiles from "../data/profiles.json";
import links from "../data/links.json";
import articles from "../data/articles.json";
import books from "../data/books.json";
import decks from "../data/slides.json";

/**
 * Number of feed-driven entries shown on the top page.
 * Kept in sync with the `slice(0, 3)` calls in src/pages/index.astro.
 */
const recentItemCount = 3;

/**
 * Escape the characters that would otherwise be read as Markdown syntax.
 * Titles come from external feeds, so they cannot be trusted to be plain text.
 * `_` is deliberately left alone: CommonMark does not treat intraword
 * underscores as emphasis, so escaping them only adds noise to account names
 * like `@kimkim0106_3218`, which are meant to be read as raw text.
 */
function escapeText(value: string): string {
  return value.replace(/([\\`*[\]])/g, "\\$1");
}

/**
 * Wrap a URL in angle brackets when it contains characters that would
 * terminate an inline link destination early.
 */
function formatUrl(url: string): string {
  return /[\s()<>]/.test(url) ? `<${url}>` : url;
}

function link(text: string, url: string): string {
  return `[${escapeText(text)}](${formatUrl(url)})`;
}

/**
 * Render the top page as Markdown, mirroring the sections of
 * src/pages/index.astro. Served at /index.md for text browsers,
 * terminals and machine readers.
 *
 * @param site Absolute base URL used to expand the site's internal links,
 *             so the document stays usable when read outside the site.
 */
export function buildIndexMarkdown(site: URL): string {
  const absolute = (path: string) => new URL(path, site).toString();
  const currentYear = new Date().getFullYear();

  const sections = [
    // Kept in sync with the `title` / `description` consts in src/pages/index.astro.
    "# kimkim0106's HP",
    "kimkim0106's Website. My profile, blog, books, slides.",

    "## About me",
    profiles
      .map((profile) => `- **${escapeText(profile.key)}**: ${escapeText(profile.value)}`)
      .join("\n"),

    "## Links",
    links
      .map((item) => `- **${escapeText(item.name)}**: ${link(item.account_name, item.url)}`)
      .join("\n"),

    "## Blog",
    articles
      .slice(0, recentItemCount)
      .map((article) => `- ${link(article.title, article.url)} (${article.published})`)
      .join("\n"),
    `Read more on ${link("kimkim0106's blog", "https://kimkim0106.hatenablog.com/")}.`,

    "## Books",
    books
      .map((book) => `- ${link(book.name, absolute(`/books/${book.slug}/`))} (${book.published})`)
      .join("\n"),
    `Book details are available on ${link("Books", absolute("/books/"))}.`,

    "## Slides",
    decks
      .slice(0, recentItemCount)
      .map((deck) => {
        const event = deck.event ? ` @${escapeText(deck.event)}` : "";
        return `- ${link(deck.title, deck.url)} (${deck.published}${event})`;
      })
      .join("\n"),
    `More slides are available on ${link("Speaker Deck", "https://speakerdeck.com/kimkim0106")}.`,

    "---",
    `© 2011-${currentYear} kimkim0106`,
  ];

  return `${sections.join("\n\n")}\n`;
}
