import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().required(),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  REDIS_URL: Joi.string().uri().required(),
  OTP_GRAPHQL_URL: Joi.string().uri().default('http://localhost:8888/otp/gtfs/v1'),
  GBFS_VLILLE_URL: Joi.string().uri().default('https://transport.data.gouv.fr/gbfs/vlille'),
});
