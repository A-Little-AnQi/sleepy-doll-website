export const repoUrl = 'https://github.com/A-Little-AnQi/Sleepy-Doll';
export const releasesUrl = `${repoUrl}/releases`;
export const productVersion = '0.1.0';
export const docsUrl = '/docs/guide';
export const discordUrl = 'https://discord.gg/RXmHGPDpj4';
export const qqUrl = 'https://qm.qq.com/q/93M0VzolRC';

export interface DirectoryItem { label: string; note?: string; href: string; external?: boolean }
export interface NavEntry { label: string; href: string; external?: boolean; directory?: { title: string; note: string; items: DirectoryItem[] } }

export const navEntries: NavEntry[] = [
  { label: '下载', href: '/#download', directory: {
    title: '下载 Sleepy Doll', note: 'Windows x64', items: [
      { label: 'Windows 安装包', note: '最新可用版本', href: '/#download' },
      { label: '历史版本', note: 'GitHub Releases', href: releasesUrl, external: true },
      { label: '源码计划', note: '0.1.0 源码暂不开放', href: '/docs/developer#源码' },
    ],
  } },
  { label: '工具与扩展', href: '/#extensions', directory: {
    title: '工具与扩展', note: '当前支持 BetterGI', items: [
      { label: 'BetterGI', note: '连接与配置', href: '/docs/guide#第-2-步-连接-BetterGI' },
      { label: '技能与插件', href: '/docs/guide#技能与插件' },
    ],
  } },
  { label: '文档', href: '/docs', directory: {
    title: '帮助文档', note: '配置、操作与问题排查', items: [
      { label: '使用指南', href: '/docs/guide' },
      { label: '常见问题', href: '/docs/faq' },
      { label: '更新日志', href: '/docs/changelog' },
      { label: '开发者的话', href: '/docs/developer' },
    ],
  } },
];

export const hero = {
  eyebrow: '发条枢 · 桌面 AI 助手', title: 'Sleepy Doll', sub: '连接工具，用对话完成任务。',
  primary: '下载 Windows 版', secondary: '查看使用指南 ↗',
};

export interface PhaseCopy { lines: [string, string]; note: string }
export const phases: PhaseCopy[] = [
  { lines: ['用对话，', '管理任务。'], note: '查询信息、调用工具、执行任务。' },
  { lines: ['连接工具，', '扩展能力。'], note: '通过插件接入工具，使用现有配置与功能。' },
  { lines: ['保存任务，', '重复使用。'], note: '将已完成的操作保存为快捷任务，后续直接运行。' },
];

export const ending = { title: '下载 Sleepy Doll', sub: '配置模型，即可开始使用。', cta: '下载 Windows 版 ↗' };
export const pillars = [
  { id: 'bgi', title: 'BetterGI 集成', note: '连接本机 BetterGI，无需迁移现有配置。' },
  { id: 'extensions', title: '技能与插件', note: '插件接入工具，技能补充操作说明。' },
  { id: 'protocols', title: '模型配置', note: '连接模型 API，或使用 Ollama 本地模型。' },
];
export const footerNote = '© 2026 Sleepy Doll / 发条枢';
