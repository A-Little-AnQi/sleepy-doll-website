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
  { key: 'guide', title: '使用说明', description: '添加模型与连接 BetterGI。', source: guide },
  { key: 'faq', title: '常见问题', description: '连接、任务和用户数据。', source: faq },
  { key: 'changelog', title: '更新日志', description: '版本变化与历史发布。', source: changelog },
  { key: 'developer', title: '开发者的话', description: '试用说明与后续安排。', source: developer },
];
