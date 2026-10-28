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

/** An episode entry exposed to the SPA via /route. */
interface Episode {
  /** SPA-facing URL, served by GET /api/storage/:name. */
  url: string;
}

/** Shape returned by GET /route. */
interface RouteResponse {
  storage: {
    endpoint: string;
  };
  episodes: Episode[];
}

/**
 * Default episode list. These are the known generated news files. The `url`
 * is the SPA-facing path, served by `GET /api/storage/:name`.
 */
const EPISODES: Episode[] = [
  { url: '/api/storage/2026_10_w5_full_news.wav' },
  { url: '/api/storage/2026_10_w4_full_news.wav' },
  { url: '/api/storage/full_news_full_news.wav' },
  { url: '/api/storage/week5_broadcast_audio.wav' },
  { url: '/api/storage/2026_07_w3_full_news.wav' },
  { url: '/api/storage/2026_07_w3.wav' },
  { url: '/api/storage/2026_08_w1_full_news.wav' },
  { url: '/api/storage/2026_08_w2_full_news.wav' },
  { url: '/api/storage/Newsfront.mp3' },
];

@Controller('route')
export class RouteController {
  constructor(private readonly storage: StorageService) {}

  /**
   * GET /route
   *
   * Returns the storage endpoint and the known episode list so a React SPA can
   * render and consume them. Each episode's `url` points at /api/storage/:name.
   */
  @Get()
  getRoute(): RouteResponse {
    const endpoint = this.storage.getStorageBaseUrl();
    if (!endpoint) {
      throw new HttpException(
        'STORAGE_URL is not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      storage: { endpoint },
      episodes: EPISODES,
    };
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
