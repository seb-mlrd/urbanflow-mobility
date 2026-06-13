import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokens1780851000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "tokenHash"  character varying NOT NULL,
        "userId"     uuid              NOT NULL,
        "expiresAt"  TIMESTAMPTZ       NOT NULL,
        "createdAt"  TIMESTAMPTZ       NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_tokenHash" ON "refresh_tokens" ("tokenHash")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
