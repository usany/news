import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { StorageService } from './storage.service';

@Module({
  imports: [],
  controllers: [AppController, RouteController],
  providers: [AppService, StorageService, RouteService],
})
export class AppModule {}
