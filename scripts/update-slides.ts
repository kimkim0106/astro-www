import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { Temporal } from 'temporal-polyfill';

const targetFilePath = './src/data/slides.json';
const feedUrl = 'https://speakerdeck.com/kimkim0106.atom';
const maxSlides = 3;

interface AtomEntry {
    title: string;
    link: { '@_href': string } | { '@_href': string }[];
    content: { '#text': string } | string;
    published: string;
}

function getEntryUrl(link: AtomEntry['link']): string {
    if (Array.isArray(link)) {
        return link[0]?.['@_href'] ?? '';
    }
    return link?.['@_href'] ?? '';
}

function getEventName(content: AtomEntry['content']): string {
    const text = typeof content === 'string' ? content : content?.['#text'] ?? '';
    const match = text.match(/^\d{4}\/\d{2}\/\d{2}\s+(.+?)\s+にて発表$/);
    return match?.[1] ?? '';
}

fetch(feedUrl)
    .then((res) => res.text())
    .then((text) => {
        const parser = new XMLParser({ ignoreAttributes: false });
        const result = parser.parse(text);
        const entries: AtomEntry[] = (() => {
            if (!result.feed.entry) {
                console.log('No entries found');
                return [];
            }
            else if (!Array.isArray(result.feed.entry)) {
                return [ result.feed.entry ];
            }
            else {
                return result.feed.entry;
            }
        })();

        const slides = entries.map((entry) => {
            return {
                title: entry.title,
                url: getEntryUrl(entry.link),
                event: getEventName(entry.content),
                published: Temporal.Instant.from(entry.published).toZonedDateTimeISO('Asia/Tokyo'),
            };
        });

        const sorted = slides.sort((a, b) => {
            return Temporal.ZonedDateTime.compare(b.published, a.published);
        });

        const output = sorted.slice(0, maxSlides).map((slide) => {
            return {
                title: slide.title,
                url: slide.url,
                event: slide.event,
                published: slide.published.toPlainDate().toString(),
            };
        });

        fs.writeFileSync(targetFilePath, JSON.stringify(output, null, 2));
    })
    .catch((error) => {
        console.error('Failed to update slides:', error);
        process.exit(1);
    });
