import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RouteController } from './route.controller.js';
import { StorageProxyController } from './storage-proxy.controller.js';
import { StorageService } from './storage.service.js';

@Module({
  imports: [],
  controllers: [AppController, RouteController, StorageProxyController],
  providers: [AppService, StorageService],
})
export class AppModule {}
