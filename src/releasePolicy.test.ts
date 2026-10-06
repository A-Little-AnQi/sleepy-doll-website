import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptedRelease, channelReleases } from './releasePolicy.ts';

const manifest = (version: string, channel: 'stable' | 'test') => ({
  version, channel, url: `https://sleepy-doll-download.restless-nh3.com/releases/${version}/Sleepy-Doll-${version}-setup.exe`,
  size: 7_000_000, sha256: 'a'.repeat(64), notes: '', publishedAt: '',
});
test('更新的测试版不覆盖正式下载；正式缺失不回退测试', () => {
  const selected = channelReleases(manifest('0.1.0', 'stable'), manifest('0.2.0-alpha.10', 'test'));
  assert.equal(selected.release?.version, '0.1.0');
  assert.equal(selected.testRelease?.version, '0.2.0-alpha.10');
  assert.equal(channelReleases(null, manifest('0.2.0-beta.1', 'test')).release, null);
});
test('测试后缀、伪造通道、旧测试包和恶意下载地址被正确区分', () => {
  assert.equal(acceptedRelease(manifest('0.1.0-alpha.1', 'test'), 'test')?.channel, 'test');
  assert.equal(acceptedRelease(manifest('0.2.0-rc.1', 'stable'), 'stable'), null);
  assert.equal(acceptedRelease(manifest('0.1.0', 'test'), 'stable'), null);
  assert.equal(acceptedRelease(manifest('0.0.1', 'test'), 'test'), null);
  assert.equal(acceptedRelease(manifest('0.1.0-alpha.01', 'test'), 'test'), null);
  assert.equal(acceptedRelease({ ...manifest('0.1.0', 'stable'), url: 'https://evil.example/installer.exe' }, 'stable'), null);
  assert.equal(acceptedRelease({ ...manifest('0.1.0', 'stable'), url: manifest('0.1.0', 'stable').url + '?anything=1' }, 'stable'), null);
});
