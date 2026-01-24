import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { Temporal } from 'temporal-polyfill';

const targetFilePath = './src/data/slides.json';
const feedUrl = 'https://speakerdeck.com/kimkim0106.atom';
const maxSlides = 3;

fetch(feedUrl)
    .then((res) => res.text())
    .then((text) => {
        const parser = new XMLParser({ ignoreAttributes: false });
        const result = parser.parse(text);
        const entries = (() => {
            if (!result.feed.entry) {
                console.log('No entries found');
                return [];
            }
            else if (!Array.isArray(result.feed.entry)) {
                return [ result.feed.entry ];
            }
            else {
                return result.feed.entry as any[];
            }
        })();

        const slides = entries.map((entry: { title: string, link: { '@_href': string }, published: string }) => {
            return {
                title: entry.title,
                url: entry.link['@_href'],
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
                published: slide.published.toPlainDate().toString(),
            };
        });

        fs.writeFileSync(targetFilePath, JSON.stringify(output, null, 2));
    });
