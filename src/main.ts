import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseService } from './services/database/database.service';

const PORT = process.env.PORT || 8080;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const prismaService = app.get(DatabaseService);
  await prismaService.enableShutdownHooks(app);
  await app.listen(PORT).then(() => {
    console.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
