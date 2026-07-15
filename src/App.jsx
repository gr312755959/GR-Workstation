import { useEffect, useState } from 'react';
import heroImage from './assets/hero-abstract.png';
import DarkVeil from './DarkVeil.jsx';
import { contactInfo, getAssetUrl, videoLibrary } from './portfolioContent.js';

const profile = {
  name: '郭瑞',
  title: '视频制作部主管',
  position: '后期制作 / 短视频 / AI视频工作流',
  heroTitle: '郭瑞视频作品集',
  heroLead: ['拍摄·剪辑·包装', 'AI熟练应用一体化'],
  heroDesc:
    '9年视频制作经验，长期负责教育行业视频团队管理、课程包装、宣传片、短视频矩阵和AI内容生产探索。',
  company: '优路教育 · 视频制作部主管',
  education: '江西科技师范大学 · 动画本科',
  city: '郑州',
};

const navItems = [
  { label: '首页', href: '#hero' },
  { label: '履历', href: '#profile' },
  { label: '作品', href: '#projects' },
  { label: '能力', href: '#strengths' },
  { label: '联系', href: '#contact' },
];

const stats = [
  { value: '9+', label: '年视频制作经验' },
  { value: '千万级', label: '短视频播放案例' },
  { value: '百万级', label: '项目科普短视频' },
  { value: '50万+', label: '月度带货销售额案例' },
];

const profileCards = [
  {
    title: '能独立完成',
    text: '前期拍摄、灯光机位、剪辑包装、字幕调色、导出交付。',
  },
  {
    title: '能带队交付',
    text: '跨部门需求、拍摄排期、人员协同、周会月会和素材复用。',
  },
  {
    title: '能用AI提效',
    text: '用ChatGPT、Gemini、即梦、Seedance等工具辅助策划、分镜和视频生产。',
  },
];

const projectDetails = {
  promo: {
    mediaIndex: 2,
    category: 'PROMO / 品牌叙事',
    result: '品牌形象与项目表达',
    brief: '覆盖企业形象、师资介绍和项目宣传，兼顾信息传达、节奏与品牌质感。',
    tags: ['宣传片', '品牌形象', '项目表达'],
  },
  mix: {
    mediaIndex: 2,
    category: 'MONTAGE / 节奏设计',
    result: '节奏控制与风格化剪辑',
    brief: '把现场、人物和品牌素材重新组织，形成更有情绪和观看张力的视觉表达。',
    tags: ['混剪视频', '节奏设计', '视觉包装'],
  },
  ai: {
    mediaIndex: 1,
    category: 'AI VIDEO / 新工具应用',
    result: 'AI短剧与AI视频工作流',
    brief: '把大模型、AI图像和AI视频工具接入文案、分镜、画面与成片生产。',
    tags: ['AI视频', 'AI短剧', '工作流'],
  },
  course: {
    mediaIndex: 0,
    category: 'COURSE / 后期包装',
    result: '课程整套拍摄与包装',
    brief: '负责灯光、录制、抠像、MG包装、字幕、调色和最终交付。',
    tags: ['课程包装', '灯光搭建', 'MG动画'],
  },
  short: {
    mediaIndex: 0,
    category: 'SHORT FORM / 内容生产',
    result: '矩阵内容与千万级播放案例',
    brief: '覆盖选题、脚本、拍摄、剪辑、封面和数据复盘，形成稳定内容生产链路。',
    tags: ['短视频', '矩阵运营', '数据复盘'],
  },
  event: {
    mediaIndex: 0,
    category: 'EVENT / 现场执行',
    result: '活动摄影与现场记录',
    brief: '处理场地、机位、灯光、人物和现场节奏，保留真实、有传播价值的关键画面。',
    tags: ['活动拍摄', '现场记录', '人物摄影'],
  },
  documentary: {
    mediaIndex: 0,
    category: 'DOCUMENTARY / 人物故事',
    result: '人物纪录与纪实叙事',
    brief: '参与《中国风骨之顾脉李门》等项目，覆盖采访、空镜、剪辑、配乐和字幕。',
    tags: ['纪录片', '人物采访', '叙事剪辑'],
  },
  ads: {
    mediaIndex: 2,
    category: 'ADS / 产品转化',
    result: '信息流广告与产品视觉',
    brief: '制作面向平台传播和转化的短视频广告、产品视觉与动态包装素材。',
    tags: ['信息流广告', '产品视觉', '动效'],
  },
};

const projects = videoLibrary.map((category) => ({
  libraryId: category.id,
  title: category.label,
  count: category.videos.length,
  ...projectDetails[category.id],
}));

const strengths = [
  { title: '拍得稳', text: '熟悉佳能、索尼设备，能处理场地、灯光、机位、收音和现场节奏。' },
  { title: '剪得准', text: '长期使用PR、AE、PS、达芬奇、剪映，覆盖剪辑、调色、字幕、抠像、MG和混剪。' },
  { title: '懂平台', text: '理解短视频选题、节奏、封面、口播、转化和数据复盘，不只停留在画面好看。' },
  { title: '会用AI', text: '能把大模型、AI图像、AI视频工具接入真实流程，提升策划、分镜和生产效率。' },
  { title: '能管理', text: '承担排期、协同、交付、人员管理、会议汇报和素材复用。' },
  { title: '懂教育', text: '长期服务职业教育内容，熟悉课程、直播、考试科普和教育产品宣传边界。' },
];

function handleCardPointerMove(event) {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  card.style.setProperty('--pointer-x', `${x * 100}%`);
  card.style.setProperty('--pointer-y', `${y * 100}%`);
  card.style.setProperty('--rotate-x', `${(0.5 - y) * 3.5}deg`);
  card.style.setProperty('--rotate-y', `${(x - 0.5) * 4.5}deg`);
}

function handleCardPointerLeave(event) {
  const card = event.currentTarget;
  card.style.setProperty('--pointer-x', '50%');
  card.style.setProperty('--pointer-y', '50%');
  card.style.setProperty('--rotate-x', '0deg');
  card.style.setProperty('--rotate-y', '0deg');
}

function getMediaOrientation(media) {
  const dimensions = media?.note?.match(/(\d+)×(\d+)/);
  if (!dimensions) return 'landscape';
  return Number(dimensions[1]) < Number(dimensions[2]) ? 'portrait' : 'landscape';
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
}

function usePortfolioMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealItems = [...document.querySelectorAll('[data-reveal]')];
    const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
    const sections = [...document.querySelectorAll('main section[id]')];
    const progress = document.querySelector('.scroll-progress');
    let frame = 0;

    root.classList.add('motion-ready');

    if (reducedMotion) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    const revealObserver = reducedMotion
      ? null
      : new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
        );

    revealItems.forEach((item) => revealObserver?.observe(item));

    const updateScrollState = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollRange > 0 ? Math.min(scrollTop / scrollRange, 1) : 0;
      progress?.style.setProperty('--progress', ratio);
      root.style.setProperty('--hero-shift', `${Math.min(scrollTop, 900) * 0.12}px`);

      const marker = scrollTop + window.innerHeight * 0.38;
      let activeId = sections[0]?.id;
      sections.forEach((section) => {
        if (section.offsetTop <= marker) activeId = section.id;
      });

      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${activeId}`);
      });

      frame = 0;
    };

    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(updateScrollState);
    };

    const handlePointer = (event) => {
      root.style.setProperty('--cursor-x', `${event.clientX}px`);
      root.style.setProperty('--cursor-y', `${event.clientY}px`);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('pointermove', handlePointer, { passive: true });
    }
    updateScrollState();

    return () => {
      revealObserver?.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointer);
      if (frame) cancelAnimationFrame(frame);
      root.classList.remove('motion-ready');
    };
  }, []);
}

function App() {
  usePortfolioMotion();

  const featuredCategories = videoLibrary.filter(
    (category) => category.featured && category.videos.some((video) => video.src)
  );
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeHeroId, setActiveHeroId] = useState(featuredCategories[0]?.id || '');
  const [wechatCopied, setWechatCopied] = useState(false);
  const activeCategory = videoLibrary.find((category) => category.id === activeCategoryId) || null;
  const activeHeroCategory =
    featuredCategories.find((category) => category.id === activeHeroId) || featuredCategories[0] || null;
  const activeHeroVideo =
    activeHeroCategory?.videos.find((video) => video.featured && video.heroSrc) ||
    activeHeroCategory?.videos.find((video) => video.type === 'video' && video.src) ||
    null;
  const heroVideoUrl = activeHeroVideo
    ? getAssetUrl(activeHeroVideo.heroSrc || activeHeroVideo.src)
    : '';

  const handleWechatCopy = async () => {
    await copyText(contactInfo.wechat);
    setWechatCopied(true);
    window.setTimeout(() => setWechatCopied(false), 1800);
  };

  return (
    <main className="site-shell">
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-aura" aria-hidden="true" />
      <Header />

      <section className={`hero-section${heroVideoUrl ? ' has-video' : ''}`} id="hero">
        <div className="hero-veil" aria-hidden="true">
          <DarkVeil />
        </div>
        {heroVideoUrl ? (
          <video
            className="hero-video"
            key={heroVideoUrl}
            src={heroVideoUrl}
            poster={activeHeroVideo?.poster ? getAssetUrl(activeHeroVideo.poster) : undefined}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        ) : null}
        <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-frame" aria-hidden="true" />
        <div className="content-width hero-layout">
          <div className="hero-copy">
            <p className="hero-pill">2026 Portfolio · Video Creator</p>
            <h1>
              <span>{profile.name}</span><strong>视频作品集</strong>
            </h1>
            <p className="hero-lead">
              {profile.heroLead.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <p className="hero-desc">{profile.heroDesc}</p>
            <div className="hero-actions">
              <a className="button primary" href="#projects">
                查看作品
              </a>
              <a className="button ghost" href="#contact">
                联系沟通
              </a>
            </div>
          </div>
        </div>
        {featuredCategories.length > 0 ? (
          <div className="hero-preview-dock" aria-label="首页作品快速预览">
            <span>QUICK PREVIEW</span>
            <div className="hero-preview-tabs">
              {featuredCategories.map((category) => (
                <button
                  type="button"
                  className={category.id === activeHeroCategory?.id ? 'is-active' : ''}
                  key={category.id}
                  onClick={() => setActiveHeroId(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="hero-preview-open"
              onClick={() => setActiveCategoryId(activeHeroCategory.id)}
            >
              完整播放
            </button>
          </div>
        ) : null}
        <div className="hero-scroll-cue" aria-hidden="true"><span /></div>
      </section>

      <section className="profile-section section-spacing" id="profile" data-chapter="01">
        <SectionTitle eyebrow="PROFILE" title="工作履历" />

        <div className="content-width hero-stats profile-stats">
          {stats.map((item, index) => (
            <article
              className="interactive-card"
              data-reveal
              key={item.label}
              style={{ '--reveal-delay': `${index * 70}ms` }}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
            >
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>

        <div className="content-width profile-overview">
          <article
            className="identity-card interactive-card"
            data-reveal
            onPointerMove={handleCardPointerMove}
            onPointerLeave={handleCardPointerLeave}
          >
            <span>GR</span>
            <h3>{profile.company}</h3>
            <p>{profile.education}</p>
            <p>{profile.city}</p>
          </article>

          <div className="profile-cards">
            {profileCards.map((item, index) => (
              <article
                className="interactive-card"
                data-reveal
                key={item.title}
                style={{ '--reveal-delay': `${(index + 1) * 80}ms` }}
                onPointerMove={handleCardPointerMove}
                onPointerLeave={handleCardPointerLeave}
              >
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-section section-spacing" id="projects" data-chapter="02">
        <SectionTitle
          eyebrow="WORK LIBRARY"
          title="作品分类"
        />

        <div className="content-width category-strip" data-reveal>
          {videoLibrary.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => setActiveCategoryId(category.id)}
              aria-label={`打开${category.label}作品库`}
            >
              <span>{category.label}</span>
              {category.videos.length > 0 ? <small>{category.videos.length}</small> : null}
            </button>
          ))}
        </div>

        <div className="content-width projects-grid">
          {projects.map((project, index) => {
            const projectCategory = videoLibrary.find((category) => category.id === project.libraryId);
            const projectMedia = projectCategory?.videos[project.mediaIndex || 0] || null;

            return (
              <article
              className="project-card interactive-card"
              data-reveal
              key={project.title}
              style={{
                '--reveal-delay': `${index < 2 ? index * 90 : ((index - 2) % 3) * 80}ms`,
              }}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
              onClick={() => setActiveCategoryId(project.libraryId)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveCategoryId(project.libraryId);
                }
              }}
              role="button"
              tabIndex="0"
              aria-label={`查看${project.title}分类作品`}
            >
              <div className="project-media" aria-hidden="true">
                {projectMedia?.poster ? (
                  <img src={getAssetUrl(projectMedia.poster)} alt="" loading="lazy" />
                ) : null}
                <span>{String(index + 1).padStart(2, '0')}</span>
                <small>{project.count} WORKS</small>
                <i />
              </div>
              <div className="project-info">
                <p>{project.category}</p>
                <h3>{project.title}</h3>
                <strong>{project.result}</strong>
                <span className="brief">{project.brief}</span>
                <div className="tag-row">
                  {project.tags.map((tag) => (
                    <em key={tag}>{tag}</em>
                  ))}
                </div>
              </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="strengths-section section-spacing" id="strengths" data-chapter="03">
        <SectionTitle
          eyebrow="CAPABILITY"
          title="个人优势"
        />

        <div className="content-width strengths-grid">
          {strengths.map((item, index) => (
            <article
              className="strength-card interactive-card"
              data-reveal
              key={item.title}
              style={{ '--reveal-delay': `${(index % 3) * 80}ms` }}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact" data-chapter="04">
        <div className="contact-rings" aria-hidden="true" />
        <div className="content-width contact-content" data-reveal>
          <p className="section-kicker">CONTACT</p>
          <h2>
            <span>面向视频制作与AI内容创作岗位</span>
            <span>永远相信美好的事情即将发生</span>
          </h2>
          <div className="contact-grid">
            <button type="button" className="contact-item" onClick={handleWechatCopy}>
              <strong>微信</strong>
              <span>{contactInfo.wechat}</span>
              <small>{wechatCopied ? '已复制微信号' : '点击复制'}</small>
            </button>
            <a className="contact-item" href={`mailto:${contactInfo.email}`}>
              <strong>邮箱</strong>
              <span>{contactInfo.email}</span>
              <small>点击发送邮件</small>
            </a>
            {contactInfo.resume.file ? (
              <a
                className="contact-item"
                href={getAssetUrl(contactInfo.resume.file)}
                target="_blank"
                rel="noreferrer"
              >
                <strong>{contactInfo.resume.label}</strong>
                <span>在线查看</span>
                <small>PDF / 网页链接</small>
              </a>
            ) : (
              <div className="contact-item contact-item-disabled">
                <strong>{contactInfo.resume.label}</strong>
                <span>待上传</span>
                <small>后续支持 PDF 或网页链接</small>
              </div>
            )}
          </div>
        </div>
      </section>

      <VideoLibraryModal category={activeCategory} onClose={() => setActiveCategoryId(null)} />
    </main>
  );
}

function VideoLibraryModal({ category, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [category?.id]);

  useEffect(() => {
    if (!category) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [category, onClose]);

  if (!category) return null;

  const currentMedia = category.videos[activeIndex] || null;
  const mediaOrientation = getMediaOrientation(currentMedia);

  return (
    <div className="video-modal" role="dialog" aria-modal="true" aria-label={`${category.label}作品库`}>
      <button type="button" className="video-modal-backdrop" onClick={onClose} aria-label="关闭作品库" />
      <div className="video-modal-panel">
        <header className="video-modal-header">
          <div>
            <p>VIDEO LIBRARY</p>
            <h2>{category.label}</h2>
            <span>{category.description}</span>
          </div>
          <button type="button" className="video-modal-close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </header>

        <div className="video-modal-body">
          <div className={`video-player-shell is-${mediaOrientation}`}>
            {currentMedia?.src && currentMedia.type === 'image' ? (
              <img
                key={currentMedia.src}
                src={getAssetUrl(currentMedia.poster || currentMedia.src)}
                alt={currentMedia.title}
              />
            ) : currentMedia?.src ? (
              <video
                key={currentMedia.src}
                src={getAssetUrl(currentMedia.src)}
                poster={currentMedia.poster ? getAssetUrl(currentMedia.poster) : undefined}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <div className="video-empty-state">
                <i aria-hidden="true" />
                <strong>这个分类正在等待你的作品</strong>
                <span>视频上传后，这里会显示播放器和可切换的视频列表。</span>
              </div>
            )}
          </div>

          <aside className="video-playlist" aria-label="作品列表">
            <div className="video-playlist-title">
              <span>作品列表</span>
              <small>{category.videos.length} 个作品</small>
            </div>
            {category.videos.length > 0 ? (
              category.videos.map((media, index) => (
                <button
                  type="button"
                  className={index === activeIndex ? 'is-active' : ''}
                  key={`${media.title}-${index}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <em>{String(index + 1).padStart(2, '0')}</em>
                  <span>
                    <strong>{media.title}</strong>
                    <small>{media.note || category.label}</small>
                  </span>
                </button>
              ))
            ) : (
              <div className="video-upload-hint">
                <strong>素材文件夹</strong>
                <code>public/assets/{category.folder}</code>
                <span>建议上传 MP4（H.264）格式。</span>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className={`content-width section-title${desc ? '' : ' section-title-clean'}`} data-reveal>
      <p className="section-kicker">{eyebrow}</p>
      <h2>{title}</h2>
      {desc ? <p>{desc}</p> : null}
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#hero" aria-label="返回首页">
        <span>GR</span>
        <strong>Guo Rui</strong>
      </a>
      <nav aria-label="页面导航">
        {navItems.map((item) => (
          <a href={item.href} key={item.href} className={item.href === '#hero' ? 'is-active' : ''}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="header-contact" href="#contact">
        联系
      </a>
    </header>
  );
}

export default App;
