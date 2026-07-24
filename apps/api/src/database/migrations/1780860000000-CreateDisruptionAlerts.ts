import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDisruptionAlerts1780860000000 implements MigrationInterface {
  name = 'CreateDisruptionAlerts1780860000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "disruption_alerts" (
        "id"                uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "gtfsAlertId"        character varying NOT NULL,
        "routeGtfsId"        character varying NOT NULL,
        "routeShortName"     character varying NOT NULL,
        "headerText"         character varying NOT NULL,
        "descriptionText"    text,
        "severity"           character varying NOT NULL,
        "effectiveStart"     TIMESTAMPTZ,
        "effectiveEnd"       TIMESTAMPTZ,
        "isActive"           boolean           NOT NULL DEFAULT true,
        "createdAt"          TIMESTAMPTZ       NOT NULL DEFAULT now(),
        "updatedAt"          TIMESTAMPTZ       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_disruption_alerts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_disruption_alerts_gtfsAlertId" UNIQUE ("gtfsAlertId")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_disruption_alerts_routeGtfsId" ON "disruption_alerts" ("routeGtfsId")
    `);

    await queryRunner.query(`
      CREATE TABLE "line_subscriptions" (
        "id"              uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "profileId"       uuid              NOT NULL,
        "routeGtfsId"     character varying NOT NULL,
        "routeShortName"  character varying NOT NULL,
        "fromLabel"       character varying,
        "fromLat"         double precision,
        "fromLng"         double precision,
        "toLabel"         character varying,
        "toLat"           double precision,
        "toLng"           double precision,
        "createdAt"       TIMESTAMPTZ       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_line_subscriptions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_line_subscriptions_profiles"
          FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_line_subscriptions_profileId" ON "line_subscriptions" ("profileId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_line_subscriptions_routeGtfsId" ON "line_subscriptions" ("routeGtfsId")
    `);

    await queryRunner.query(`
      CREATE TABLE "user_notifications" (
        "id"                    uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "profileId"             uuid        NOT NULL,
        "alertId"               uuid        NOT NULL,
        "read"                  boolean     NOT NULL DEFAULT false,
        "alternativeItinerary"  jsonb,
        "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_notifications_profiles"
          FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_notifications_disruption_alerts"
          FOREIGN KEY ("alertId") REFERENCES "disruption_alerts"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_user_notifications_profileId" ON "user_notifications" ("profileId")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_notifications"`);
    await queryRunner.query(`DROP TABLE "line_subscriptions"`);
    await queryRunner.query(`DROP TABLE "disruption_alerts"`);
  }
}
