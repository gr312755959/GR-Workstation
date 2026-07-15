import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mediaRoot = path.join(root, 'public', 'assets', 'videos');
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'guo-rui-portfolio-media';

if (!accountId || !accessKeyId || !secretAccessKey) {
  throw new Error('Missing Cloudflare R2 credentials. See .env.example.');
}

if (!existsSync(mediaRoot)) {
  throw new Error(`Media folder not found: ${mediaRoot}`);
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const contentTypes = {
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function collectFiles(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(folder, entry.name);
    return entry.isDirectory() ? collectFiles(fullPath) : [fullPath];
  });
}

function objectKey(filePath) {
  return `videos/${path.relative(mediaRoot, filePath).split(path.sep).join('/')}`;
}

async function isAlreadyUploaded(key, size) {
  try {
    const object = await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return Number(object.ContentLength) === size;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') return false;
    throw error;
  }
}

const files = collectFiles(mediaRoot);
const totalBytes = files.reduce((sum, filePath) => sum + statSync(filePath).size, 0);
let completedBytes = 0;

console.log(`Uploading ${files.length} files (${(totalBytes / 1024 ** 3).toFixed(2)} GB) to ${bucketName}...`);

for (const [index, filePath] of files.entries()) {
  const size = statSync(filePath).size;
  const key = objectKey(filePath);

  if (await isAlreadyUploaded(key, size)) {
    completedBytes += size;
    console.log(`[${index + 1}/${files.length}] Already uploaded: ${key}`);
    continue;
  }

  const upload = new Upload({
    client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: createReadStream(filePath),
      ContentType: contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      CacheControl: 'public, max-age=3600',
    },
    queueSize: 4,
    partSize: 16 * 1024 * 1024,
    leavePartsOnError: false,
  });

  let lastPercent = -1;
  upload.on('httpUploadProgress', ({ loaded = 0 }) => {
    const percent = Math.floor((loaded / size) * 100);
    if (percent >= lastPercent + 20 || percent === 100) {
      lastPercent = percent;
      console.log(`  ${percent}% ${key}`);
    }
  });

  await upload.done();
  completedBytes += size;
  console.log(`[${index + 1}/${files.length}] Uploaded (${Math.round((completedBytes / totalBytes) * 100)}% total): ${key}`);
}

console.log('All portfolio media has been uploaded successfully.');

