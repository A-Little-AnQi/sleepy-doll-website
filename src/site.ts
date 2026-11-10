export const productVersion = '0.2.0';
export const docsUrl = '/docs/guide';
export const discordUrl = 'https://discord.gg/RXmHGPDpj4';
export const qqUrl = 'https://qm.qq.com/q/93M0VzolRC';

export interface DirectoryItem { label: string; note?: string; href: string; external?: boolean }
export interface NavEntry { label: string; href: string; external?: boolean; directory?: { title: string; note: string; items: DirectoryItem[] } }

export const navEntries: NavEntry[] = [
  { label: '下载', href: '/#download', directory: {
    title: '下载 Pudding', note: 'Windows x64', items: [
      { label: 'Windows 安装包', note: '最新可用版本', href: '/#download' },
      { label: '源码与开源', note: '代码以 GPL-3.0 公开', href: '/docs/developer#源码' },
    ],
  } },
  { label: '工具与扩展', href: '/#extensions', directory: {
    title: '工具与扩展', note: '当前支持 BetterGI', items: [
      { label: '连接工具', note: 'BetterGI 与其他工具', href: '/docs/connections' },
      { label: '技能与插件', href: '/docs/connections#技能与插件' },
    ],
  } },
  { label: '文档', href: '/docs', directory: {
    title: '帮助文档', note: '配置、操作与问题排查', items: [
      { label: '安装与配置', href: '/docs/guide' },
      { label: '连接工具', href: '/docs/connections' },
      { label: '快捷任务', href: '/docs/quick-tasks' },
      { label: '定时任务', href: '/docs/scheduled-tasks' },
      { label: '故障排查', href: '/docs/faq' },
      { label: '更新日志', href: '/docs/changelog' },
    ],
  } },
];

export const hero = {
  eyebrow: '面向工具软件的通用 AI 助手', title: 'Pudding', sub: '析构万理的发条公主',
  primary: '下载 Windows 版', secondary: '查看使用指南 ↗',
};

export interface PhaseCopy { lines: [string, string]; note: string }
export const phases: PhaseCopy[] = [
  { lines: ['用对话，', '管理任务。'], note: '查询资料、处理配置、组织操作，再交给对应的软件执行。' },
  { lines: ['连接工具，', '扩展能力。'], note: '已接入 BetterGI 全部能力，插件与技能持续扩展。' },
  { lines: ['保存任务，', '重复使用。'], note: '保存为快捷任务直接运行，也支持 Windows 计划任务定时执行。' },
];

export const ending = { title: '下载 Pudding', sub: '配置好模型，即可开始使用。', cta: '下载 Windows 版 ↗' };
export const pillars = [
  { id: 'bgi', title: '全部工具，全部能力', note: '无论想配置什么，说一句话就能做到。' },
  { id: 'extensions', title: '技能与插件', note: '插件接入工具，内置技能补充操作知识。' },
  { id: 'protocols', title: '模型自选', note: '参考各服务商官方文档配置 api-key，也可用本地模型。' },
];
export const footerNote = '© 2026 Pudding，曾用名 Sleepy Doll';
