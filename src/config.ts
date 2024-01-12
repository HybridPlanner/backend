import { ConfigModuleOptions } from '@nestjs/config';
import * as Joi from 'joi';

export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production';

  // Database url for Prisma
  DATABASE_URL: string;

  // Rainbow credentials
  RAINBOW_LOGIN: string;
  RAINBOW_PASSWORD: string;

  // Rainbow application credentials
  RAINBOW_HOST: string;
  RAINBOW_APPLICATION_ID: string;
  RAINBOW_APPLICATION_SECRET: string;

  // Mail settings
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_DEFAULT_FROM: string;
}

/**
 * Configuration options for the application.
 */
const configOptions: ConfigModuleOptions = {
  validationSchema: Joi.object({
    PORT: Joi.number().default(3000).required(),
    NODE_ENV: Joi.string()
      .valid('development', 'production')
      .default('development')
      .required(),

    // Database url for Prisma (only here to enforce the presence of the variable)
    DATABASE_URL: Joi.string().required(),

    // Rainbow credentials
    RAINBOW_LOGIN: Joi.string().required(),
    RAINBOW_PASSWORD: Joi.string().required(),

    // Rainbow application credentials
    RAINBOW_HOST: Joi.string().default('sandbox').required(),
    RAINBOW_APPLICATION_ID: Joi.string().required(),
    RAINBOW_APPLICATION_SECRET: Joi.string().required(),

    // Mail settings
    MAIL_HOST: Joi.string().default('mailhog').required(),
    MAIL_PORT: Joi.number().default(1025).required(),
    MAIL_USER: Joi.string().default('').required(),
    MAIL_PASS: Joi.string().default('').required(),
    MAIL_DEFAULT_FROM: Joi.string()
      .default('"No Reply" <noreply@example.com>')
      .required(),
  }),
};

export default configOptions;
