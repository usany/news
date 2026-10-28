import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RouteController } from './route.controller.js';
import { RouteService } from './route.service.js';
import { StorageService } from './storage.service.js';

@Module({
  imports: [],
  controllers: [AppController, RouteController],
  providers: [AppService, StorageService, RouteService],
})
export class AppModule {}
