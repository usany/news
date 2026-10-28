import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { StorageService } from './storage.service.js';

/** Response shape for the storage item listing route. */
interface ListResponse {
  baseUrl: string;
  prefix: string;
  count: number;
  items: Array<{
    name: string;
    url: string;
    size: number;
    lastModified: string;
  }>;
}

@Controller('route')
export class RouteController {
  constructor(private readonly storage: StorageService) {}

  /**
   * GET /route
   *
   * Lists the objects available in the configured object-storage bucket so a
   * React SPA can render and consume them. Each item carries a `url` that can
   * be used directly (e.g. in <audio>/<img> tags or fetch()).
   *
   * Query params:
   *   ?prefix=  — only return objects whose key starts with this prefix.
   */
  @Get()
  async getItems(@Query('prefix') prefix?: string): Promise<ListResponse> {
    const items = await this.storage.listItems(prefix ?? '');

    return {
      baseUrl: this.storage.getStorageBaseUrl(),
      prefix: prefix ?? '',
      count: items.length,
      items: items.map((i) => ({
        name: i.name,
        url: i.url,
        size: i.size,
        lastModified: i.lastModified,
      })),
    };
  }
}

// Re-export a factory helper so a plain HTTP handler can be built without the
// full Nest DI graph if needed (e.g. for serverless/adapter deployments).
export function createRouteHandler(storage: StorageService) {
  return async (prefix?: string): Promise<ListResponse> => {
    let items;
    try {
      items = await storage.listItems(prefix ?? '');
    } catch (err) {
      throw new HttpException(
        (err as Error).message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return {
      baseUrl: storage.getStorageBaseUrl(),
      prefix: prefix ?? '',
      count: items.length,
      items: items.map((i) => ({
        name: i.name,
        url: i.url,
        size: i.size,
        lastModified: i.lastModified,
      })),
    };
  };
}
