import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT || 8080;

/**
 * Boots up the application by creating the NestJS application instance,
 * enabling shutdown hooks, and starting the server to listen on the specified port.
 * @returns A promise that resolves when the application is successfully bootstrapped.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // Start listenning for shutdown hooks

  app.enableShutdownHooks();

  await app.listen(PORT).then(() => {
    console.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
