import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { Temporal } from 'temporal-polyfill';
import type { Article } from '../src/data/types.js';

const targetFilePath = './src/data/articles.json';
const fetchFeedConfigs = [
    {
        feedUrl: 'https://kimkim0106.hatenablog.com/feed/author/kimkim0106',
        entryUrlRegexp: /https:\/\/kimkim0106\.hatenablog\.com\/entry\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/[0-9]{6}/,
    },
];

Promise.all(
    fetchFeedConfigs.map((config) => fetch(config.feedUrl)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.text();
        })
        .then((text) => {
            const parser = new XMLParser({ ignoreAttributes: false, entityExpansionLimit: 10000 });
            const result = parser.parse(text);
            const entries = (() => {
                if (!result.feed.entry) {
                    console.warn('No entries found');
                    return [];
                }
                else if (!Array.isArray(result.feed.entry)) {
                    return [ result.feed.entry ];
                }
                else {
                    return result.feed.entry as any[];
                }
            })();
            const articles = entries.map((entry: { title: string, link: { '@_href': string } | { '@_href': string }[], published: string }) => {
                const links = Array.isArray(entry.link) ? entry.link : [ entry.link ];
                const matchedLink = links.find((element) => element['@_href'].match(config.entryUrlRegexp));
                if (!matchedLink) {
                    throw new Error(`No matching URL found for entry: ${entry.title}`);
                }
                return {
                    title: entry.title,
                    url: matchedLink['@_href'],
                    published: Temporal.Instant.from(entry.published).toZonedDateTimeISO('Asia/Tokyo'),
                };
            });
            return articles;
        })
    )
).then((articles) => {
    const newArticles = articles.flat().sort((a, b) => {
        return Temporal.ZonedDateTime.compare(b.published, a.published);
    });

    const output: Article[] = newArticles.map((article) => {
        return {
            title: article.title,
            url: article.url,
            published: article.published.toPlainDate().toString(),
        };
    });

    fs.writeFileSync(targetFilePath, JSON.stringify(output, null, 2));
}).catch((error) => {
    console.error('Failed to update articles:', error);
    process.exit(1);
});
