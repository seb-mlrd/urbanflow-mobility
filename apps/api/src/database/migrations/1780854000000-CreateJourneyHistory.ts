import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateJourneyHistory1780854000000 implements MigrationInterface {
  name = 'CreateJourneyHistory1780854000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "journey_history" (
        "id"              uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "profileId"       uuid              NOT NULL,
        "dominantMode"    character varying NOT NULL,
        "distanceMeters"  double precision  NOT NULL,
        "durationSeconds" integer           NOT NULL,
        "co2Grams"        integer           NOT NULL,
        "fromLabel"       character varying NOT NULL,
        "toLabel"         character varying NOT NULL,
        "fromLat"         double precision  NOT NULL,
        "fromLng"         double precision  NOT NULL,
        "toLat"           double precision  NOT NULL,
        "toLng"           double precision  NOT NULL,
        "departureAt"     TIMESTAMPTZ       NOT NULL,
        "arrivalAt"       TIMESTAMPTZ       NOT NULL,
        "createdAt"       TIMESTAMPTZ       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_journey_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_journey_history_profiles"
          FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "journey_history"`);
  }
}
