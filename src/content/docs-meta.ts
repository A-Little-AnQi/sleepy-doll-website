/**
 * 文档站导航元数据（纯数据模块）。
 *
 * 只描述路由、文件与分组，不引入 Markdown 或浏览器模块，供路由、SEO 与
 * Vite 配置共用。Markdown 文件统一放在 src/content/docs/ 下，file 即文件名。
 *
 * heading 锚点规则与 GitHub 一致（github-slugger）：小写化、去标点、
 * 空格转连字符，中文保留，如同名 heading 自动加 -1 后缀，
 * 如「连接 BetterGI」→ #连接-bettergi。旧地址里保留英文大写的锚点
 * 由运行时按大小写不敏感兜底匹配，aliases 不逐条收录。
 */

export type DocsGroupId = 'start' | 'features' | 'project';

export interface DocsGroupMeta {
  id: DocsGroupId;
  label: string;
}

export interface DocsAlias {
  /** 旧地址（含锚点），如 /docs/guide#第-1-步-配置模型。 */
  from: string;
  /** 新地址（含锚点），如 /docs/guide#配置模型；指向页首时省略锚点。 */
  to: string;
}

export interface DocMeta {
  /** 稳定标识，等于文件名去掉扩展名。 */
  key: string;
  /** 站内路由，overview 挂在 /docs 下。 */
  path: string;
  /** src/content/docs/ 下的 Markdown 文件名。 */
  file: string;
  /** 页面标题。 */
  title: string;
  /** 页面描述，用于列表与 SEO。 */
  description: string;
  group: DocsGroupId;
  /** 组内排序，小的在前。 */
  order: number;
  /** 旧地址迁移：from 为旧地址（含锚点），to 为新地址；不收录自映射。 */
  aliases?: DocsAlias[];
}

export const docsGroups: DocsGroupMeta[] = [
  { id: 'start', label: '开始使用' },
  { id: 'features', label: '功能指南' },
  { id: 'project', label: '帮助与项目' },
];

export const docsMeta: DocMeta[] = [
  {
    key: 'overview',
    path: '/docs',
    file: 'overview.md',
    title: '文档总览',
    description: 'Pudding 文档总览：当前支持的工具与文档目录。',
    group: 'start',
    order: 10,
    aliases: [
      { from: '/docs/overview', to: '/docs' },
      { from: '/docs#从哪里开始', to: '/docs#快速开始' },
    ],
  },
  {
    key: 'guide',
    path: '/docs/guide',
    file: 'guide.md',
    title: '安装与配置',
    description: '安装 Pudding、配置模型、检查更新与备份。',
    group: 'start',
    order: 20,
    aliases: [
      { from: '/docs/guide#快速开始', to: '/docs#快速开始' },
      { from: '/docs/guide#第-1-步-配置模型', to: '/docs/guide#配置模型' },
      { from: '/docs/guide#第-2-步-连接-BetterGI', to: '/docs/connections#连接-bettergi' },
      { from: '/docs/guide#第-3-步-发起查询', to: '/docs/chat#发起查询' },
      { from: '/docs/guide#操作审批', to: '/docs/chat#操作审批' },
      { from: '/docs/guide#执行记录与停止', to: '/docs/chat#执行记录与停止' },
      { from: '/docs/guide#快捷任务', to: '/docs/quick-tasks' },
      { from: '/docs/guide#技能与插件', to: '/docs/connections#技能与插件' },
      { from: '/docs/guide#更新与备份', to: '/docs/guide#备份与恢复' },
      { from: '/docs/guide#问题反馈', to: '/docs/developer#反馈渠道' },
    ],
  },
  {
    key: 'connections',
    path: '/docs/connections',
    file: 'connections.md',
    title: '连接工具',
    description: '连接 BetterGI 与其他工具，管理技能与插件。',
    group: 'start',
    order: 30,
  },
  {
    key: 'chat',
    path: '/docs/chat',
    file: 'chat.md',
    title: '对话与审批',
    description: '发起请求、审批级别、执行记录与停止。',
    group: 'features',
    order: 10,
  },
  {
    key: 'quick-tasks',
    path: '/docs/quick-tasks',
    file: 'quick-tasks.md',
    title: '快捷任务',
    description: '把重复操作封装成一键执行的快捷任务。',
    group: 'features',
    order: 20,
  },
  {
    key: 'scheduled-tasks',
    path: '/docs/scheduled-tasks',
    file: 'scheduled-tasks.md',
    title: '定时任务',
    description: '按指定日期、按天、每周或每月自动执行一组快捷任务。',
    group: 'features',
    order: 30,
    aliases: [
      { from: '/docs/scheduled-tasks#任务库里找不到目标', to: '/docs/faq#任务库中没有目标任务' },
    ],
  },
  {
    key: 'faq',
    path: '/docs/faq',
    file: 'faq.md',
    title: '故障排查',
    description: '定时任务未触发、任务库中没有目标任务的排查步骤。',
    group: 'project',
    order: 10,
    aliases: [
      { from: '/docs/faq#常见问题', to: '/docs/faq' },
      { from: '/docs/faq#模型调用会产生费用吗', to: '/docs/guide#隐私与费用' },
      { from: '/docs/faq#对话和-api-key-如何处理', to: '/docs/guide#隐私与费用' },
      { from: '/docs/faq#连接工具后能使用哪些功能', to: '/docs/connections' },
      { from: '/docs/faq#定时任务到点没有运行怎么办', to: '/docs/faq#定时任务未触发' },
      { from: '/docs/faq#任务库里找不到某个任务', to: '/docs/faq#任务库中没有目标任务' },
      { from: '/docs/faq#暂停和停止有什么区别', to: '/docs/scheduled-tasks#暂停与停止' },
      { from: '/docs/faq#每月-31-日和月末会重复执行吗', to: '/docs/scheduled-tasks#每月' },
      { from: '/docs/faq#一条定时任务能设两个执行时刻吗', to: '/docs/scheduled-tasks#执行时刻' },
      { from: '/docs/faq#快捷任务和定时任务有什么区别', to: '/docs/scheduled-tasks' },
    ],
  },
  {
    key: 'changelog',
    path: '/docs/changelog',
    file: 'changelog.md',
    title: '更新日志',
    description: '近期功能更新与各版本改进。',
    group: 'project',
    order: 20,
  },
  {
    key: 'developer',
    path: '/docs/developer',
    file: 'developer.md',
    title: '项目与反馈',
    description: '项目方向、开源仓库与反馈渠道。',
    group: 'project',
    order: 30,
  },
];
