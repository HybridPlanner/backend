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
}

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
  }),
};

export default configOptions;
