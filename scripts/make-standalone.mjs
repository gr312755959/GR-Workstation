import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');
const dist = join(root, 'dist');
const indexPath = join(dist, 'index.html');
const outputPath = join(root, '双击打开网站.html');

let html = readFileSync(indexPath, 'utf8');

const cssHref = html.match(/href="(\.\/assets\/[^"]+\.css)"/)?.[1];
const jsSrc = html.match(/src="(\.\/assets\/[^"]+\.js)"/)?.[1];

if (!cssHref || !jsSrc) {
  throw new Error('Cannot find built CSS or JS assets in dist/index.html');
}

const css = readFileSync(join(dist, cssHref.replace('./', '')), 'utf8');
let js = readFileSync(join(dist, jsSrc.replace('./', '')), 'utf8');

const imageRefs = [...js.matchAll(/\.\/assets\/[^"']+\.png/g)].map((match) => match[0]);
for (const ref of [...new Set(imageRefs)]) {
  const imagePath = join(dist, ref.replace('./', ''));
  const base64 = readFileSync(imagePath).toString('base64');
  js = js.split(ref).join(`data:image/png;base64,${base64}`);
}

const viteImageRefs = [...js.matchAll(/new URL\("([^"]+\.png)",import\.meta\.url\)\.href/g)].map((match) => match[1]);
for (const ref of [...new Set(viteImageRefs)]) {
  const imagePath = join(dist, 'assets', ref);
  const base64 = readFileSync(imagePath).toString('base64');
  const dataUrl = `"data:image/png;base64,${base64}"`;
  js = js
    .split(`""+new URL("${ref}",import.meta.url).href`)
    .join(dataUrl)
    .split(`new URL("${ref}",import.meta.url).href`)
    .join(dataUrl);
}

html = html
  .replace(/<script type="module" crossorigin src="\.\/assets\/[^"]+\.js"><\/script>\s*/g, '')
  .replace(/<link rel="stylesheet" crossorigin href="\.\/assets\/[^"]+\.css">\s*/g, '')
  .replace('</head>', `  <style>\n${css}\n  </style>\n  </head>`)
  .replace(
    '</body>',
    `  <script>\n${js.replaceAll('</script', '<\\/script')}\n  </script>\n  </body>`
  )
  .replace('<title>Guo Rui Portfolio</title>', '<title>郭瑞个人作品集</title>');

writeFileSync(outputPath, html, 'utf8');
console.log(`Standalone file written: ${outputPath}`);
