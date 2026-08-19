import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlannedItineraries1780880000000 implements MigrationInterface {
  name = 'CreatePlannedItineraries1780880000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "planned_itineraries" (
        "id"            uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "profileId"     uuid              NOT NULL,
        "fromLabel"     character varying NOT NULL,
        "toLabel"       character varying NOT NULL,
        "fromLat"       double precision  NOT NULL,
        "fromLng"       double precision  NOT NULL,
        "toLat"         double precision  NOT NULL,
        "toLng"         double precision  NOT NULL,
        "plannedAt"     TIMESTAMPTZ       NOT NULL,
        "selectedModes" text[]            NOT NULL DEFAULT '{}',
        "createdAt"     TIMESTAMPTZ       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_planned_itineraries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_planned_itineraries_profiles"
          FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "planned_itineraries"`);
  }
}
