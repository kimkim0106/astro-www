import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { Temporal } from 'temporal-polyfill';

const targetFilePath = './src/data/articles.json';
const fetchFeedConfigs = [
    {
        feedUrl: 'https://kimkim0106.hatenablog.com/feed/author/kimkim0106',
        entryUrlRegexp: /https:\/\/kimkim0106\.hatenablog\.com\/entry\/[0-9]{4}\/[0-9]{2}\/[0-9]{2}\/[0-9]{6}/,
    },
];
const articlesLimit = 3;

Promise.all(
    fetchFeedConfigs.map((config) => fetch(config.feedUrl)
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
            const articles = entries.map((entry: { title: string, link: { '@_href': string }[], published: string }) => {
                return {
                    title: entry.title,
                    url: entry.link.find((element) => element['@_href'].match(config.entryUrlRegexp))!['@_href'],
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
    
    const output = newArticles.map((article) => {
        return {
            title: article.title,
            url: article.url,
            published: article.published.toPlainDate().toString(),
        };
    }).slice(0, articlesLimit);

    fs.writeFileSync(targetFilePath, JSON.stringify(output, null, 2));
});
