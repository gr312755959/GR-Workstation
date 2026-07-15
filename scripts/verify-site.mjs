import { createServer } from 'node:http';
import { createReadStream, existsSync, readdirSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = resolve('.');
const dist = resolve(root, 'dist');
const screenshots = resolve(root, 'verification');
const bundledNodeModules =
  'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const pnpmDirectory = join(bundledNodeModules, '.pnpm');
const playwrightPackage = readdirSync(pnpmDirectory)
  .filter((name) => /^playwright@\d/.test(name))
  .sort()
  .at(-1);

if (!playwrightPackage) {
  throw new Error('Cannot find bundled Playwright runtime');
}

const requireFromBundledNode = createRequire(
  join(pnpmDirectory, playwrightPackage, 'node_modules', 'playwright', 'package.json')
);
const { chromium } = requireFromBundledNode('playwright');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

function serveDist() {
  const server = createServer((request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname);
    const relativePath = pathname.replace(/^\/+/, '');
    const target = pathname === '/' ? join(dist, 'index.html') : join(dist, relativePath);
    const safeTarget = target.startsWith(dist) && existsSync(target) ? target : join(dist, 'index.html');

    response.writeHead(200, {
      'content-type': mimeTypes[extname(safeTarget)] || 'application/octet-stream',
    });
    createReadStream(safeTarget).pipe(response);
  });

  return new Promise((resolveServer) => {
    server.listen(0, '127.0.0.1', () => resolveServer(server));
  });
}

async function revealPage(page) {
  const revealItems = page.locator('[data-reveal]');
  const count = await revealItems.count();

  for (let index = 0; index < count; index += 1) {
    await revealItems.nth(index).scrollIntoViewIfNeeded();
    await page.waitForTimeout(110);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
}

const server = await serveDist();
const { port } = server.address();
const url = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
const errors = [];
const failedRequests = [];
const importantResponses = [];

try {
  await mkdir(screenshots, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => {
    if (!/\.(mp4|webm)(\?|$)/i.test(request.url())) failedRequests.push(request.url());
  });
  page.on('response', (response) => {
    const responseUrl = response.url();
    if (responseUrl.includes('/assets/') || responseUrl === url + '/') {
      importantResponses.push({
        url: responseUrl,
        status: response.status(),
        contentType: response.headers()['content-type'] || '',
      });
    }
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await revealPage(page);
  await page.screenshot({ path: join(screenshots, 'desktop-home.png'), fullPage: true });

  const bodyText = await page.locator('body').innerText();
  const requiredText = [
    '郭瑞',
    '作品分类',
    '个人优势',
    'AI视频',
    '千万级',
    '18937221697',
    '312755959@qq.com',
  ];
  const missing = requiredText.filter((text) => !bodyText.includes(text));
  const privacyCheckText = bodyText.replaceAll('18937221697', '');
  const forbiddenPatterns = [
    { label: 'mobile-number-pattern', pattern: /1[3-9]\d{9}/ },
    { label: 'private-family-info', pattern: /女儿|老婆|已婚|出生于/ },
  ];
  const leaked = forbiddenPatterns
    .filter((item) => item.pattern.test(privacyCheckText))
    .map((item) => item.label);

  const projectLinkCount = await page.locator('a[href="#projects"]').count();
  if (projectLinkCount > 0) {
    await page.click('a[href="#projects"]');
    await page.waitForTimeout(350);
  }
  const projectsVisible = await page.locator('#projects').isVisible();
  const categoryButtonCount = await page.locator('.category-strip button').count();
  const projectCardCount = await page.locator('.project-card').count();
  const projectCardTitles = await page.locator('.project-card h3').allTextContents();
  let videoModalVisible = false;
  let portraitVideoReady = false;
  let portraitVideoMetrics = null;

  if (categoryButtonCount > 0) {
    const firstCategory = page.locator('.category-strip button').first();
    await firstCategory.scrollIntoViewIfNeeded();
    await firstCategory.click();
    await page.waitForTimeout(450);
    videoModalVisible = await page.locator('.video-modal').isVisible();
    await page.screenshot({ path: join(screenshots, 'video-library-modal.png') });
    await page.locator('.video-modal-close').click();
  }

  const shortVideoButton = page.getByRole('button', { name: '打开短视频作品库' });
  if (await shortVideoButton.count()) {
    await shortVideoButton.click();
    const portraitVideo = page.locator('.video-player-shell.is-portrait video');
    await portraitVideo.waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const video = document.querySelector('.video-player-shell.is-portrait video');
      return video && video.readyState >= 1;
    });
    portraitVideoMetrics = await portraitVideo.evaluate(async (video) => {
      video.muted = true;
      await video.play().catch(() => {});
      const videoBox = video.getBoundingClientRect();
      const shellBox = video.parentElement.getBoundingClientRect();
      return {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        objectFit: getComputedStyle(video).objectFit,
        boxWidth: videoBox.width,
        boxHeight: videoBox.height,
        shellWidth: shellBox.width,
        shellHeight: shellBox.height,
      };
    });
    portraitVideoReady = Boolean(
      portraitVideoMetrics.videoWidth < portraitVideoMetrics.videoHeight &&
      portraitVideoMetrics.objectFit === 'contain' &&
      portraitVideoMetrics.boxWidth <= portraitVideoMetrics.shellWidth + 1 &&
      portraitVideoMetrics.boxHeight <= portraitVideoMetrics.shellHeight + 1
    );
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(screenshots, 'portrait-video-modal.png') });
    await page.locator('.video-modal-close').click();
  }

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await revealPage(page);
  await page.screenshot({ path: join(screenshots, 'mobile-home.png'), fullPage: true });

  const standalonePath = join(root, '双击打开网站.html');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(pathToFileURL(standalonePath).href, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  await revealPage(page);
  await page.screenshot({ path: join(screenshots, 'standalone-file-test.png'), fullPage: true });
  const standaloneText = await page.locator('body').innerText();
  const standaloneReady = requiredText.every((text) => standaloneText.includes(text));

  await browser.close();
  server.close();

  const result = {
    url,
    screenshots: [
      join(screenshots, 'desktop-home.png'),
      join(screenshots, 'mobile-home.png'),
      join(screenshots, 'standalone-file-test.png'),
      join(screenshots, 'video-library-modal.png'),
      join(screenshots, 'portrait-video-modal.png'),
    ],
    requiredTextMissing: missing,
    forbiddenTextFound: leaked,
    projectLinkCount,
    projectsAnchorVisible: projectsVisible,
    categoryButtonCount,
    projectCardCount,
    projectCardTitles,
    videoModalVisible,
    portraitVideoReady,
    portraitVideoMetrics,
    standaloneFileReady: standaloneReady,
    consoleErrors: errors,
    failedRequests,
    importantResponses,
  };

  console.log(JSON.stringify(result, null, 2));
  if (
    missing.length ||
    leaked.length ||
    projectLinkCount === 0 ||
    !projectsVisible ||
    categoryButtonCount !== 8 ||
    projectCardCount !== 8 ||
    !videoModalVisible ||
    !portraitVideoReady ||
    !standaloneReady ||
    errors.length ||
    failedRequests.length
  ) {
    process.exitCode = 1;
  }
} catch (error) {
  await browser.close().catch(() => {});
  server.close();
  throw error;
}
