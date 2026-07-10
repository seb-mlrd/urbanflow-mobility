import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().required(),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  REDIS_URL: Joi.string().uri().required(),
  OTP_GRAPHQL_URL: Joi.string()
    .uri()
    .default('http://localhost:8888/otp/gtfs/v1'),
  GBFS_VLILLE_STATION_INFORMATION_URL: Joi.string()
    .uri()
    .default('https://media.ilevia.fr/opendata/station_information.json'),
  GBFS_VLILLE_STATION_STATUS_URL: Joi.string()
    .uri()
    .default('https://media.ilevia.fr/opendata/station_status.json'),
  GBFS_LIME_FREE_BIKE_STATUS_URL: Joi.string()
    .uri()
    .default(
      'https://data.lime.bike/api/partners/v2/gbfs/lille/free_bike_status',
    ),
});
