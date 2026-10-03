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
  eyebrow: '发条枢', title: 'Sleepy Doll', sub: '用对话管理你的游戏助手。',
  primary: '下载 Windows', secondary: '使用说明 ↗',
};

export interface PhaseCopy { lines: [string, string]; note: string }
export const phases: PhaseCopy[] = [
  { lines: ['直接说，', '你想做什么。'], note: '查配置、改参数、整理调度组，从一句话开始。' },
  { lines: ['需要确认时，', '看一眼再继续。'], note: '要改哪里、改成什么，会在对话里列出来。' },
  { lines: ['常用的操作，', '存下来再用。'], note: '保存成快捷任务，下次直接运行。' },
];

export const ending = { title: '先试试这个版本。', sub: '目前接入 BetterGI，正式版还在准备。', cta: '下载 Windows ↗' };
export const pillars = [
  { id: 'bgi', title: '连接 BetterGI', note: '查配置、整理脚本和调度组。' },
  { id: 'extensions', title: '技能与插件', note: '添加操作说明，接入更多工具。' },
  { id: 'protocols', title: '模型自己选', note: '兼容多种模型接口，也支持 Ollama。' },
];
export const footerNote = '© 2026 Sleepy Doll / 发条枢';
