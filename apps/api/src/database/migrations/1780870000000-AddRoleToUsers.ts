import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsers1780870000000 implements MigrationInterface {
  name = 'AddRoleToUsers1780870000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM ('user', 'admin')`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" "users_role_enum" NOT NULL DEFAULT 'user'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
