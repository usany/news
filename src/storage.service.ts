import { Injectable } from '@nestjs/common';

/**
 * A single item discovered in the object storage bucket.
 * `name` is the object key; `url` is a directly-fetchable pre-signed/par URL.
 */
export interface StorageItem {
  name: string;
  url: string;
  size: number;
  lastModified: string;
}

/**
 * Lists and maps objects in the Oracle Cloud Object Storage bucket referenced
 * by `STORAGE_URL` in `.env`.
 *
 * `STORAGE_URL` is a pre-authenticated request (PAR) URL of the form:
 *   https://objectstorage.<region>.oraclecloud.com/p/<par-token>/n/<ns>/b/<bucket>/o/
 *
 * Listing uses the S3-compatible ListObjects API by appending an encoded
 * `prefix` (the object key after `/o/`), plus the S3 list parameters.
 * Individual object URLs are built from the base URL + the object name.
 */
@Injectable()
export class StorageService {
  private readonly baseUrl: string;

  constructor() {
    const raw = process.env.STORAGE_URL ?? '';
    // Normalize to end with a single trailing slash so we can append keys.
    this.baseUrl = raw.endsWith('/') ? raw : `${raw}/`;
  }

  /** The configured storage base URL (empty string if unset). */
  getStorageBaseUrl(): string {
    return this.baseUrl;
  }

  /** True when a STORAGE_URL is configured. */
  isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  /**
   * Fetch the raw object listing from the bucket. Returns an array of items
   * parsed from the S3-compatible XML response.
   */
  async listItems(prefix = ''): Promise<StorageItem[]> {
    if (!this.isConfigured()) {
      throw new Error('STORAGE_URL is not configured');
    }

    const url = new URL(this.baseUrl);
    // The base URL already contains the namespace/bucket/o/ prefix. The S3
    // list API expects `prefix` to be the object-key prefix, not the full URL.
    url.searchParams.set('list-type', '2');
    url.searchParams.set('delimiter', '/');
    if (prefix) url.searchParams.set('prefix', prefix);
    url.searchParams.set('max-keys', '1000');

    const res = await fetch(url, {
      // Oracle Object Storage PAR endpoints only support JSON responses;
      // requesting XML returns 406 Not Acceptable.
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `Failed to list storage objects (HTTP ${res.status}): ${body.slice(0, 500)}`,
      );
    }

    const text = await res.text();
    return parseListResponse(text, this.baseUrl);
  }
}

/**
 * Parse the S3-compatible ListObjectsV2 XML response into StorageItems.
 * Falls back to parsing a JSON error/list body where possible.
 */
function parseListResponse(xml: string, baseUrl: string): StorageItem[] {
  // Prefer JSON if the endpoint returned it (Oracle PAR endpoints do).
  const trimmed = xml.trim();
  if (trimmed.startsWith('{')) {
    try {
      const json = JSON.parse(trimmed);
      if (Array.isArray(json.objects)) {
        return json.objects.map((o: any) => ({
          name: String(o.name ?? ''),
          url: buildItemUrl(baseUrl, String(o.name ?? '')),
          size: Number(o.size ?? 0),
          lastModified: String(o.lastModified ?? o.timeModified ?? ''),
        }));
      }
    } catch {
      /* fall through to XML parsing */
    }
  }

  const items: StorageItem[] = [];
  const contentsRe = /<Contents>([\s\S]*?)<\/Contents>/g;
  let match: RegExpExecArray | null;
  while ((match = contentsRe.exec(xml)) !== null) {
    const block = match[1];
    const name = extractTag(block, 'Key');
    if (!name) continue;
    items.push({
      name,
      url: buildItemUrl(baseUrl, name),
      size: Number(extractTag(block, 'Size') ?? 0),
      lastModified: extractTag(block, 'LastModified') ?? '',
    });
  }
  return items;
}

/**
 * Build a directly-fetchable object URL from the base URL and object key.
 * Only the segments of the key are percent-encoded; the `/` separators are
 * preserved so nested keys (e.g. `2026_08_w2/full.wav`) resolve correctly.
 */
function buildItemUrl(baseUrl: string, name: string): string {
  const encoded = name
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return baseUrl + encoded;
}

function extractTag(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
  const m = re.exec(block);
  return m ? m[1].trim() : undefined;
}
