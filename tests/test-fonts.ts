import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Page } from '@playwright/test';

// サイトは Noto Sans JP を Google Fonts から読み込むが、Google Fonts は同じ URL に対して
// 中身の違う 2 種類の CSS をランダムに返す。片方は太さ 100〜900 の可変フォント
// (fonts.gstatic.com/s/...)、もう片方は 500〜700 に絞った可変フォント
// (fonts.gstatic.com/l/font?kit=...) を指し、どちらを引くかで見出しの描画が
// 100〜250 ピクセルほど変わる。そのため、ビジュアルリグレッションテストでは
// Noto Sans JP だけを @fontsource の静的フォントに差し替えて固定する。
// 本番のフォント配信は変えない。

// サイトが Google Fonts に要求している太さ。src/pages/**/*.astro の
// `Noto+Sans+JP:wght@500;700` と揃える
const weights = [500, 700] as const;

// 差し替えたフォントを配信する URL。実在しないパスで、page.route() でだけ応答する
const testFontOrigin = 'https://fonts.gstatic.com/__test-fonts__';

const fontsourceDir = path.dirname(
  createRequire(import.meta.url).resolve('@fontsource/noto-sans-jp/500.css'),
);

const googleFontsCss = /^https:\/\/fonts\.googleapis\.com\/css2\?/;
const notoSansJpFace = /@font-face\s*\{[^}]*font-family:\s*'Noto Sans JP';[^}]*\}/g;

let testFontCss: Promise<string> | undefined;

// @fontsource の CSS を、woff2 だけを testFontOrigin から読む形に書き換える
async function loadTestFontCss(): Promise<string> {
  const sheets = await Promise.all(
    weights.map((weight) => readFile(path.join(fontsourceDir, `${weight}.css`), 'utf8')),
  );
  return sheets
    .join('\n')
    .replace(
      /src: url\(\.\/files\/([^)]+\.woff2)\) format\('woff2'\)[^;]*;/g,
      `src: url(${testFontOrigin}/$1) format('woff2');`,
    );
}

export async function useTestFonts(page: Page): Promise<void> {
  testFontCss ??= loadTestFontCss();

  await page.route(googleFontsCss, async (route) => {
    const response = await route.fetch();
    // Noto Color Emoji など他のフォントは Google Fonts のまま使う
    const css = (await response.text()).replace(notoSansJpFace, '');
    await route.fulfill({ response, body: `${css}\n${await testFontCss}` });
  });

  await page.route(`${testFontOrigin}/*`, async (route) => {
    // ファイル名だけを使い、@fontsource の files ディレクトリの外は読ませない
    const fileName = path.basename(new URL(route.request().url()).pathname);
    await route.fulfill({
      path: path.join(fontsourceDir, 'files', fileName),
      contentType: 'font/woff2',
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  });
}
