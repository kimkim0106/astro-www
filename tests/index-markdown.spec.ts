import { test, expect } from '@playwright/test';
import profiles from '../src/data/profiles.json' with { type: 'json' };
import links from '../src/data/links.json' with { type: 'json' };
import books from '../src/data/books.json' with { type: 'json' };

test.describe('Markdown version of the homepage', () => {
  test('/index.md is served as Markdown', async ({ request }) => {
    const response = await request.get('/index.md');

    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain("# kimkim0106's HP");
  });

  test('/index.md has the same sections as the HTML version', async ({ request }) => {
    const body = await (await request.get('/index.md')).text();

    for (const heading of ['About me', 'Links', 'Blog', 'Books', 'Slides']) {
      expect(body).toContain(`## ${heading}`);
    }
  });

  test('/index.md reflects the JSON data sources', async ({ request }) => {
    const body = await (await request.get('/index.md')).text();

    for (const profile of profiles) {
      expect(body).toContain(`- **${profile.key}**: ${profile.value}`);
    }
    for (const link of links) {
      expect(body).toContain(`](${link.url})`);
    }
  });

  test('the HTML version advertises the Markdown version', async ({ page }) => {
    await page.goto('/');

    const alternate = page.locator('link[rel="alternate"][type="text/markdown"]');
    await expect(alternate).toHaveAttribute('href', 'https://kimkim0106.net/index.md');
  });

  test('/index.md links to the site with absolute URLs', async ({ request }) => {
    const body = await (await request.get('/index.md')).text();

    // サイト外で読まれても辿れるよう、内部リンクは絶対 URL で出力する
    for (const book of books) {
      expect(body).toContain(`https://kimkim0106.net/books/${book.slug}/`);
    }
    expect(body).not.toMatch(/\]\(\/books\//);
  });
});
