import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT || 8080;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // Start listenning for shutdown hooks

  app.enableShutdownHooks();

  await app.listen(PORT).then(() => {
    console.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
