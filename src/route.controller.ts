import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { Readable as NodeReadable } from 'node:stream';
import { StorageService } from './storage.service.js';
import { audioDuration } from './audio-duration.js';

/** An episode entry exposed to the SPA via /route. */
interface Episode {
  /** SPA-facing URL, served by GET /api/storage/:name. */
  url: string;
  /** Object key in storage (used as its name). */
  name: string;
  /** Audio duration in seconds (float), or null when it cannot be determined. */
  lengthSeconds: number | null;
  /** File size in bytes. */
  size: number;
  /** Last-modified timestamp from storage. */
  lastModified: string;
}

/** Shape returned by GET /route. */
interface RouteResponse {
  storage: {
    endpoint: string;
  };
  episodes: Episode[];
}

/** Audio extensions we attempt to compute a duration for. */
const AUDIO_EXTENSIONS = ['.wav', '.wave', '.mp3'];

/** Only the first 64 KB is read from each object to determine duration. */
const HEADER_BYTES = 64 * 1024;

/**
 * Known episode object keys. The Oracle Cloud Object Storage PAR used as
 * `STORAGE_URL` authorizes object-level GET/PUT but does NOT support the
 * S3-compatible ListObjects operation, so we cannot enumerate the bucket at
 * runtime. These names are served instead (and can be overridden with the
 * `EPISODES` env var as a comma-separated list).
 */
const DEFAULT_EPISODE_NAMES = [
  '2026_10_w5_full_news.wav',
  '2026_10_w4_full_news.wav',
  'full_news_full_news.wav',
];

/** Resolve the episode names to list, from `EPISODES` env var or defaults. */
function episodeNames(): string[] {
  const raw = process.env.EPISODES ?? '';
  if (!raw.trim()) return DEFAULT_EPISODE_NAMES;
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

@Controller('route')
export class RouteController {
  constructor(private readonly storage: StorageService) {}

  /**
   * GET /route
   *
   * Lists the audio files present in the storage bucket and returns the
   * storage endpoint plus an episode list (each with its audio length) so a
   * React SPA can render and consume them.
   */
  @Get()
  async getRoute(): Promise<RouteResponse> {
    const endpoint = this.storage.getStorageBaseUrl();
    if (!endpoint) {
      throw new HttpException(
        'STORAGE_URL is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // List known episode names rather than enumerating the bucket: the PAR
    // endpoint does not support ListObjects.
    const names = episodeNames().filter((name) =>
      AUDIO_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)),
    );

    const episodes: Episode[] = await Promise.all(
      names.map(async (name) => ({
        url: `/api/storage/${name}`,
        name,
        lengthSeconds: await this.computeDuration(name),
        size: await this.computeSize(name),
        lastModified: '',
      })),
    );

    return {
      storage: { endpoint },
      episodes,
    };
  }

  /**
   * Read a small header slice of the object and compute its audio duration.
   * Returns null when the duration cannot be determined.
   */
  private async computeDuration(name: string): Promise<number | null> {
    const size = await this.computeSize(name);
    try {
      const end = Math.min(size - 1, HEADER_BYTES - 1);
      if (end < 0) return null;
      const header = await this.storage.getItemRange(name, 0, end);
      const seconds = audioDuration(name, header, size);
      return Number.isFinite(seconds) ? (seconds as number) : null;
    } catch {
      return null;
    }
  }

  /** Resolve an object's size in bytes (0 when it cannot be determined). */
  private async computeSize(name: string): Promise<number> {
    try {
      const objectUrl = this.storage.getItemUrl(name);
      const res = await fetch(objectUrl, { method: 'HEAD' });
      if (!res.ok) return 0;
      return Number(res.headers.get('content-length') ?? 0) || 0;
    } catch {
      return 0;
    }
  }
}

/** Proxy/stream an object from the object-storage endpoint to the client. */
@Controller('api/storage')
export class StorageProxyController {
  constructor(private readonly storage: StorageService) {}

  @Get(':name')
  async getStorageObject(
    @Param('name') name: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const key = this.storage.resolveKey(name);
    if (!key) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const objectUrl = this.storage.getItemUrl(key);
    const upstream = await fetch(objectUrl);
    if (!upstream.ok || !upstream.body) {
      throw new HttpException(
        `Failed to fetch object (HTTP ${upstream.status})`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const contentType =
      upstream.headers.get('content-type') ?? 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');
    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);

    // Convert the web ReadableStream to a Node stream for StreamableFile.
    const nodeStream = NodeReadable.fromWeb(
      upstream.body as import('node:stream/web').ReadableStream,
    ) as NodeReadable;

    return new StreamableFile(nodeStream);
  }
}
