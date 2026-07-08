import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGeolocationConsentToProfiles1780853000000 implements MigrationInterface {
    name = 'AddGeolocationConsentToProfiles1780853000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" ADD "geolocationConsent" boolean`);
        await queryRunner.query(`ALTER TABLE "profiles" ADD "geolocationConsentAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "geolocationConsentAt"`);
        await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "geolocationConsent"`);
    }
}
