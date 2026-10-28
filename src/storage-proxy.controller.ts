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
