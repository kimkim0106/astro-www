import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { Temporal } from 'temporal-polyfill';
import type { Slide } from '../src/data/types.js';

const targetFilePath = './src/data/slides.json';
const feedUrl = 'https://speakerdeck.com/kimkim0106.rss';

interface RssItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
}

function getEventName(description: string): string {
    const match = description.match(/^\d{4}\/\d{2}\/\d{2}\s+(.+?)\s+にて発表$/);
    if (!match && description) {
        console.warn('Event name extraction failed for description:', description);
    }
    return match?.[1] ?? '';
}

fetch(feedUrl)
    .then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.text();
    })
    .then((text) => {
        const parser = new XMLParser({ ignoreAttributes: false });
        const result = parser.parse(text);
        const items: RssItem[] = (() => {
            if (!result.rss.channel.item) {
                console.warn('No items found');
                return [];
            }
            else if (!Array.isArray(result.rss.channel.item)) {
                return [ result.rss.channel.item ];
            }
            else {
                return result.rss.channel.item;
            }
        })();

        const decks = items.map((item) => {
            return {
                title: item.title,
                url: item.link,
                event: getEventName(item.description),
                published: Temporal.Instant.from(new Date(item.pubDate).toISOString()).toZonedDateTimeISO('Asia/Tokyo'),
            };
        });

        const sorted = decks.sort((a, b) => {
            return Temporal.ZonedDateTime.compare(b.published, a.published);
        });

        const output: Slide[] = sorted.map((deck) => {
            return {
                title: deck.title,
                url: deck.url,
                event: deck.event,
                published: deck.published.toPlainDate().toString(),
            };
        });

        fs.writeFileSync(targetFilePath, JSON.stringify(output, null, 2));
    })
    .catch((error) => {
        console.error('Failed to update slides:', error);
        process.exit(1);
    });
