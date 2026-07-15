import { generatedMedia } from './generatedMedia.js';

export const contactInfo = {
  wechat: '18937221697',
  email: '312755959@qq.com',
  resume: {
    label: '个人简历',
    file: '',
  },
};

export const videoLibrary = [
  {
    id: 'promo',
    label: '宣传片',
    description: '企业宣传、品牌故事与项目形象片',
    folder: 'videos/promo',
    featured: true,
    videos: generatedMedia.promo,
  },
  {
    id: 'mix',
    label: '混剪视频',
    description: '节奏混剪、品牌情绪片与风格化剪辑',
    folder: 'videos/mix',
    featured: true,
    videos: generatedMedia.mix,
  },
  {
    id: 'ai',
    label: 'AI视频',
    description: 'AI短剧、生成式视频与AI工作流实践',
    folder: 'videos/ai',
    featured: true,
    videos: generatedMedia.ai,
  },
  {
    id: 'course',
    label: '课程包装',
    description: '课程录制、抠像、MG包装与整套交付',
    folder: 'videos/course',
    featured: true,
    videos: generatedMedia.course,
  },
  {
    id: 'short',
    label: '短视频',
    description: '账号矩阵、科普口播与爆款内容制作',
    folder: 'videos/short',
    featured: false,
    videos: generatedMedia.short,
  },
  {
    id: 'event',
    label: '活动拍摄',
    description: '活动记录、现场快剪与多机位拍摄',
    folder: 'videos/event',
    featured: false,
    videos: generatedMedia.event,
  },
  {
    id: 'documentary',
    label: '纪录片',
    description: '人物采访、纪实影像与叙事剪辑',
    folder: 'videos/documentary',
    featured: false,
    videos: generatedMedia.documentary,
  },
  {
    id: 'ads',
    label: '信息流广告',
    description: '产品视觉、广告素材与转化型短视频',
    folder: 'videos/ads',
    featured: false,
    videos: generatedMedia.ads,
  },
];

export function getAssetUrl(relativePath) {
  if (!relativePath) return '';
  if (/^(https?:|data:|blob:)/i.test(relativePath)) return relativePath;
  const cleanPath = relativePath.replace(/^\/+/, '');
  const prefix = window.location.protocol === 'file:' ? './public/assets/' : '/assets/';
  return `${prefix}${cleanPath}`;
}
