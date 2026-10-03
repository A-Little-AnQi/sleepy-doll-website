export const repoUrl = 'https://github.com/A-Little-AnQi/Sleepy-Doll';
export const releasesUrl = `${repoUrl}/releases`;
export const docsUrl = '#/docs/guide';
export const discordUrl = 'https://discord.gg/RXmHGPDpj4';
export const qqUrl = 'https://qm.qq.com/q/93M0VzolRC';

export interface DirectoryItem { label: string; note?: string; href: string; external?: boolean }
export interface NavEntry { label: string; href: string; external?: boolean; directory?: { title: string; note: string; items: DirectoryItem[] } }

export const navEntries: NavEntry[] = [
  { label: '下载', href: '#download', directory: {
    title: '下载', note: 'Windows x64', items: [
      { label: '下载安装包', note: '当前版本', href: '#download' },
      { label: 'GitHub Releases', note: '备用下载与历史版本', href: releasesUrl, external: true },
      { label: '开发说明', href: `${repoUrl}#readme`, external: true },
    ],
  } },
  { label: '扩展', href: '#extensions', directory: {
    title: '工具与扩展', note: '目前支持 BetterGI', items: [
      { label: 'BetterGI', note: '连接和使用', href: '#/docs/guide#第-2-步-连接-BetterGI' },
      { label: '技能和插件', href: '#/docs/guide#技能和插件' },
    ],
  } },
  { label: '文档', href: '#/docs', directory: {
    title: '文档', note: '从添加模型开始', items: [
      { label: '使用说明', href: '#/docs/guide' },
      { label: '常见问题', href: '#/docs/faq' },
      { label: '更新日志', href: '#/docs/changelog' },
      { label: '开发者的话', href: '#/docs/developer' },
    ],
  } },
];

export const hero = {
  eyebrow: '发条枢', title: 'Sleepy Doll', sub: '给游戏助手接上 AI。',
  primary: '下载 Windows', secondary: '使用说明 ↗',
};

export interface PhaseCopy { lines: [string, string]; note: string }
export const phases: PhaseCopy[] = [
  { lines: ['查脚本，', '改配置。'], note: '在对话里管理 BetterGI 的脚本和调度组。' },
  { lines: ['确认后，', '再执行。'], note: '操作确认和执行进度，在同一处查看。' },
  { lines: ['常用任务，', '一键运行。'], note: '把完成的操作保存下来。' },
];

export const ending = { title: '下载 Sleepy Doll', sub: '当前为测试版，需要自行配置模型。', cta: '下载 Windows ↗' };
export const pillars = [
  { id: 'bgi', title: 'BetterGI', note: '连接本机已安装的 BetterGI。' },
  { id: 'extensions', title: '技能与插件', note: '按需添加工具和操作说明。' },
  { id: 'protocols', title: '自选模型', note: '使用自己的 API，也支持 Ollama。' },
];
export const footerNote = '© 2026 Sleepy Doll / 发条枢';
