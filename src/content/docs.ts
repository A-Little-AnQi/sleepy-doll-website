/** 官网使用说明、常见问题、更新日志与开发计划。 */

import guide from './docs/guide.md?raw';
import faq from './docs/faq.md?raw';
import changelog from './docs/changelog.md?raw';
import developer from './docs/developer.md?raw';

export interface DocEntry {
  key: string;
  title: string;
  source: string;
  description: string;
}

export const docEntries: DocEntry[] = [
  { key: 'guide', title: '使用指南', description: '模型配置、工具连接与功能操作。', source: guide },
  { key: 'faq', title: '常见问题', description: '连接排查、任务处理与数据保留。', source: faq },
  { key: 'changelog', title: '更新日志', description: '已发布功能与版本变化。', source: changelog },
  { key: 'developer', title: '开发者的话', description: '测试版说明、后续计划与反馈渠道。', source: developer },
];
