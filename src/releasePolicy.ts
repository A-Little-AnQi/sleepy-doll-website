import { parse } from 'semver';
import { productVersion } from './site.ts';

export interface Release {
  version: string;
  channel: 'test' | 'stable';
  url: string;
  size: number;
  sha256: string;
  notes: string;
  publishedAt: string;
}

export function acceptedRelease(value: unknown, channel: 'stable' | 'test'): Release | null {
  const item = value as Partial<Release> | null;
  if (!item || typeof item.version !== 'string' || item.version.length > 128
    || item.version.trim() !== item.version || !/^\d/.test(item.version)
    || item.channel !== channel || typeof item.url !== 'string'
    || !Number.isSafeInteger(item.size) || (item.size ?? 0) <= 0 || (item.size ?? 0) > 256 * 1024 * 1024
    || typeof item.sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(item.sha256)) return null;
  const version = parse(item.version), minimum = parse(productVersion);
  if (!version || !minimum || (channel === 'stable' && version.prerelease.length)) return null;
  // The minimum website generation applies to the core version, so an Alpha of that generation remains eligible.
  const core = [version.major, version.minor, version.patch], floor = [minimum.major, minimum.minor, minimum.patch];
  for (let i = 0; i < 3; i++) {
    if (core[i] < floor[i]) return null;
    if (core[i] > floor[i]) break;
  }
  try {
    const url = new URL(item.url);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash
      || url.hostname !== 'sleepy-doll-download.restless-nh3.com'
      || url.pathname !== `/releases/${item.version}/Sleepy-Doll-${item.version}-setup.exe`) return null;
  } catch { return null; }
  return item as Release;
}

export function channelReleases(stable: unknown, test: unknown) {
  return { release: acceptedRelease(stable, 'stable'), testRelease: acceptedRelease(test, 'test') };
}
