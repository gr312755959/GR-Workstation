import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const videoRoot = path.join(root, 'public', 'assets', 'videos');
const posterRoot = path.join(root, 'public', 'assets', 'posters');
const customPosterRoot = path.join(posterRoot, 'custom');
const previewRoot = path.join(root, 'public', 'assets', 'previews');
const manifestPath = path.join(root, 'src', 'generatedMedia.js');

mkdirSync(posterRoot, { recursive: true });
mkdirSync(customPosterRoot, { recursive: true });
mkdirSync(previewRoot, { recursive: true });

const categoryConfig = {
  mix: { label: '混剪视频', kind: 'video' },
  promo: { label: '宣传片', kind: 'video' },
  ai: { label: 'AI视频', kind: 'video' },
  short: { label: '短视频', kind: 'video' },
  event: { label: '活动拍摄', kind: 'image' },
  course: { label: '课程包装', kind: 'video' },
  documentary: { label: '纪录片', kind: 'video' },
  ads: { label: '信息流广告', kind: 'video' },
};

const titleOverrides = {
  ai: {
    '0706 1部-中安AI3.mp4': '中安主题AI短片',
    '5.21获客一部-品牌短剧3.mp4': '品牌AI短剧',
    '6.15项目部-中心协心理AI视频.mp4': '心理主题AI视频',
  },
  course: {
    '2版-创课素材：L1升L2《讲过孩子的中国传统节日·中元节、中秋节、重阳节》-v2.0.mp4': '中国传统节日课程包装',
    '初会导学课（字体修改版）.mp4': '初会导学课程包装',
    '糖尿病.mp4': '康养课程包装',
  },
  documentary: {
    '《中国风骨》之顾脉李门查六君正式播出版~1.mp4': '《中国风骨》查六君篇',
    '《中国风骨》之顾脉李门李元军正式播出版~1.mp4': '《中国风骨》李元军篇',
  },
  mix: {
    '10.29-3.mp4': '品牌节奏混剪',
    '19.mp4': '综合项目混剪',
    '5.15项目部-PLC招聘混剪.mp4': 'PLC招聘主题混剪',
  },
  promo: {
    '10.30师资介绍视频-封面.mp4': '师资介绍宣传片',
    '6.8人工智能应用工程师视频-2.mp4': 'AI应用工程师宣传片',
    '7.1品宣视频-修改6.mp4': '品牌形象宣传片',
  },
  short: {
    '1 (2).mp4': '短视频作品 01',
    '1.mp4': '短视频作品 02',
    '11.10留学口播-2.mp4': '留学主题口播',
    '17.mp4': '短视频作品 04',
    '1暴躁.mp4': '情绪反差短视频',
    '2.mp4': '短视频作品 06',
    '20.mp4': '短视频作品 07',
    '24.mp4': '短视频作品 08',
  },
  ads: {
    '15.mp4': '信息流广告作品 01',
    '19.mp4': '信息流广告作品 02',
    '3.3星巴克咖啡大羊毛(1).mp4': '咖啡产品信息流广告',
    '5.31大码显瘦短袖.mp4': '服装产品信息流广告',
    '充电桩~1.mp4': '充电桩产品广告',
    '慢动作展示.mp4': '产品慢动作视觉',
  },
};

const heroSelections = {
  promo: '7.1品宣视频-修改6.mp4',
  mix: '5.15项目部-PLC招聘混剪.mp4',
  ai: '5.21获客一部-品牌短剧3.mp4',
  course: '2版-创课素材：L1升L2《讲过孩子的中国传统节日·中元节、中秋节、重阳节》-v2.0.mp4',
};

function run(binary, args) {
  return execFileSync(binary, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function probe(filePath) {
  const raw = run(ffprobePath, [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_type,width,height,codec_name',
    '-of', 'json',
    filePath,
  ]);
  const data = JSON.parse(raw);
  const stream = data.streams?.find((item) => item.codec_type === 'video') || {};
  return {
    duration: Number(data.format?.duration || 0),
    width: Number(stream.width || 0),
    height: Number(stream.height || 0),
    codec: stream.codec_name || '',
  };
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const rounded = Math.max(1, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return minutes ? `${minutes}:${String(remainder).padStart(2, '0')}` : `0:${String(remainder).padStart(2, '0')}`;
}

const fitFilter = [
  '[0:v]split=2[bg][fg]',
  '[bg]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,gblur=sigma=26[blurred]',
  '[fg]scale=1280:720:force_original_aspect_ratio=decrease[main]',
  '[blurred][main]overlay=(W-w)/2:(H-h)/2,format=yuv420p',
].join(';');

function makePoster(source, output, seekTime = 0) {
  const args = ['-y'];
  if (seekTime > 0) args.push('-ss', seekTime.toFixed(2));
  args.push('-i', source, '-frames:v', '1', '-filter_complex', fitFilter, '-q:v', '3', output);
  run(ffmpegPath, args);
}

function makePreview(source, output, seekTime) {
  run(ffmpegPath, [
    '-y', '-ss', seekTime.toFixed(2), '-i', source, '-t', '10',
    '-filter_complex', fitFilter,
    '-an', '-r', '24', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27',
    '-movflags', '+faststart', output,
  ]);
}

function titleFor(categoryId, fileName, index) {
  if (categoryId === 'event') return `活动现场摄影 ${String(index + 1).padStart(2, '0')}`;
  return titleOverrides[categoryId]?.[fileName]
    || path.parse(fileName).name.replace(/[~_-]+/g, ' ').trim();
}

const generatedMedia = {};
const report = [];

for (const [categoryId, config] of Object.entries(categoryConfig)) {
  const folder = path.join(videoRoot, categoryId);
  const categoryCustomPosterRoot = path.join(customPosterRoot, categoryId);
  mkdirSync(categoryCustomPosterRoot, { recursive: true });
  const files = existsSync(folder)
    ? readdirSync(folder).filter((file) => !file.startsWith('.')).sort((a, b) => a.localeCompare(b, 'zh-CN'))
    : [];

  generatedMedia[categoryId] = [];
  console.log(`\n[${config.label}] ${files.length} 个素材`);

  files.forEach((fileName, index) => {
    const source = path.join(folder, fileName);
    const number = String(index + 1).padStart(2, '0');
    const posterName = `${categoryId}-${number}.jpg`;
    const posterPath = path.join(posterRoot, posterName);
    const sourceBaseName = path.parse(fileName).name;
    const customPosterName = ['.jpg', '.jpeg', '.png', '.webp']
      .map((extension) => `${sourceBaseName}${extension}`)
      .find((candidate) => existsSync(path.join(categoryCustomPosterRoot, candidate)));
    const metadata = probe(source);
    const isVideo = config.kind === 'video';
    const seekTime = isVideo ? Math.min(Math.max(metadata.duration * 0.08, 1.5), 10) : 0;

    if (!customPosterName) makePoster(source, posterPath, seekTime);

    const item = {
      id: `${categoryId}-${number}`,
      type: config.kind,
      title: titleFor(categoryId, fileName, index),
      note: isVideo
        ? [formatDuration(metadata.duration), metadata.width && metadata.height ? `${metadata.width}×${metadata.height}` : ''].filter(Boolean).join(' · ')
        : `${metadata.width}×${metadata.height}`,
      src: `videos/${categoryId}/${fileName}`,
      poster: customPosterName
        ? `posters/custom/${categoryId}/${customPosterName}`
        : `posters/${posterName}`,
    };

    if (heroSelections[categoryId] === fileName) {
      const previewName = `${categoryId}-featured.mp4`;
      makePreview(source, path.join(previewRoot, previewName), Math.min(Math.max(metadata.duration * 0.05, 1), 6));
      item.heroSrc = `previews/${previewName}`;
      item.featured = true;
    }

    generatedMedia[categoryId].push(item);
    report.push({ category: categoryId, fileName, ...item });
    console.log(`  ${number}/${String(files.length).padStart(2, '0')} ${item.title}`);
  });
}

writeFileSync(
  manifestPath,
  `// 此文件由 npm run media:prepare 自动生成，请勿手工修改。\nexport const generatedMedia = ${JSON.stringify(generatedMedia, null, 2)};\n`,
  'utf8'
);
writeFileSync(
  path.join(root, 'public', 'assets', 'media-inventory.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8'
);

console.log(`\n完成：${report.length} 个素材已生成封面和网页清单。`);
