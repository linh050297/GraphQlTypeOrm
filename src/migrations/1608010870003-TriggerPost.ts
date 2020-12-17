import {MigrationInterface, QueryRunner} from "typeorm";

export class TriggerPost1608010870003 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- CREATE EXTENSION unaccent; RUN FIRST TIME IN NEW DATABASE

            -- ALTER TABLE post ADD COLUMN document_idx tsvector;

            UPDATE post SET document_idx = to_tsvector(coalesce(title, '')); -- RUN 1 TIME

            CREATE INDEX document_idx ON post USING GIN (document_idx);

            --Trigger
            CREATE OR REPLACE FUNCTION post_tsvector_trigger() RETURNS trigger AS $$
            begin
                new.document_idx := to_tsvector(coalesce(new.title, ''));
                RETURN new; 
            end
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE --chỉ chạy 1 lần, để DROP FUNCTION và trigger *tênfunction* cascade;
                ON post FOR EACH ROW EXECUTE PROCEDURE post_tsvector_trigger(); 
        `)
    }

    public async down(_: QueryRunner): Promise<void> {
    }

}
