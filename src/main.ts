import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { loadEnv } from './env.js';

async function bootstrap() {
  await loadEnv();
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
