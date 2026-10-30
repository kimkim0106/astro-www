import { test, expect, type Page } from '@playwright/test';
import books from '../src/data/books.json' with { type: 'json' };
import projects from '../src/data/projects.json' with { type: 'json' };

// 撮影前にフォントの読み込みと描画の安定化を待つ
async function waitForFontsAndContent(page: Page, path = '/') {
  await page.goto(path);
  // ページ全体の比較では、画面外の遅延読み込み画像も読み込んでから撮影する。
  await page.locator('img').evaluateAll(async (images: HTMLImageElement[]) => {
    await Promise.all(images.map(async (image) => {
      image.loading = 'eager';
      await image.decode();
    }));
  });
  await page.waitForLoadState('networkidle');
  
  // 静的ページの表示を確認する
  await expect(page.locator('article')).toBeVisible();
  
  // フォント読み込み完了を待つ
  await page.evaluate(() => document.fonts.ready);

  // WebKit は読み込み後も画像の描画が変化するため、従来の安定化待機を残す
  if (page.context().browser()?.browserType().name() === 'webkit') {
    await page.waitForTimeout(1000);
  }
}

test.describe('Visual Regression Tests', () => {
  test('Homepage visual regression', async ({ page }) => {
    await waitForFontsAndContent(page);
    
    // スクリーンショットを撮影して比較
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Homepage above-the-fold visual regression', async ({ page }) => {
    await waitForFontsAndContent(page);
    
    // ビューポート内のスクリーンショット
    await expect(page).toHaveScreenshot('homepage-viewport.png', {
      animations: 'disabled',
    });
  });

  test('Dark mode visual regression', async ({ page }) => {
    // ダークモードを有効化
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await waitForFontsAndContent(page);
    
    await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Mobile viewport visual regression', async ({ page }) => {
    // モバイルビューポートを設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    await waitForFontsAndContent(page);
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Tablet viewport visual regression', async ({ page }) => {
    // タブレットビューポートを設定
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await waitForFontsAndContent(page);
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Blog articles section visual regression', async ({ page }) => {
    await waitForFontsAndContent(page);
    
    // ブログセクションのスクリーンショット
    const blogSection = page.locator('#blog + ul');
    await expect(blogSection).toHaveScreenshot('blog-section.png', {
      animations: 'disabled',
    });
  });

  test('Profile section visual regression', async ({ page }) => {
    await waitForFontsAndContent(page);
    
    // プロフィールセクションのスクリーンショット
    const profileSection = page.locator('#profile + dl.profile');
    await expect(profileSection).toHaveScreenshot('profile-section.png', {
      animations: 'disabled',
    });
  });

  test('Books index visual regression', async ({ page }) => {
    await waitForFontsAndContent(page, '/books/');

    await expect(page).toHaveScreenshot('books-index-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Books index mobile visual regression', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await waitForFontsAndContent(page, '/books/');

    await expect(page).toHaveScreenshot('books-index-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  for (const book of books) {
    test(`Book detail visual regression: ${book.slug}`, async ({ page }) => {
      await waitForFontsAndContent(page, `/books/${book.slug}/`);

      await expect(page).toHaveScreenshot(`book-detail-${book.slug}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    });
  }

  test('Projects index visual regression', async ({ page }) => {
    await waitForFontsAndContent(page, '/projects/');

    await expect(page).toHaveScreenshot('projects-index-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  for (const project of projects) {
    test(`Project detail visual regression: ${project.slug}`, async ({ page }) => {
      await waitForFontsAndContent(page, `/projects/${project.slug}/`);

      await expect(page).toHaveScreenshot(`project-detail-${project.slug}.png`, {
        fullPage: true,
        animations: 'disabled',
        // YouTube の埋め込みは外部の読み込み状況で見た目が変わるため比較しない
        mask: [page.locator('.project-videos iframe')],
      });
    });
  }
});
