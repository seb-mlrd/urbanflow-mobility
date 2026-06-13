import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAddresses1780852000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "addresses" (
        "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"      character varying(50) NOT NULL,
        "label"     character varying NOT NULL,
        "lat"       double precision  NOT NULL,
        "lng"       double precision  NOT NULL,
        "profileId" uuid              NOT NULL,
        "createdAt" TIMESTAMPTZ       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_addresses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_addresses_profiles"
          FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "addresses"`);
  }
}
