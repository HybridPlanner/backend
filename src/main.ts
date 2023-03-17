import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './services/database/database.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(DatabaseService);
  await prismaService.enableShutdownHooks(app);
  await app.listen(3000);
}
bootstrap();
