import {MigrationInterface, QueryRunner} from "typeorm";

export class LastMigraForSearch1608114315750 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- alter table post add column document_idx tsvector;
            update post set document_idx = to_tsvector( coalesce(title, '') || ' ' ||unaccent(coalesce(title, '')));
            create index document_idx on post using gin (document_idx);

            --trigger *********
            CREATE OR REPLACE FUNCTION post_tsvector_unaccent_trigger() returns trigger as $$
             begin
                new.document_idx := to_tsvector( coalesce(new.title, '') || ' ' ||unaccent(coalesce(new.title, '')));
             	return new;
             end
            $$ LANGUAGE plpgsql;

             create trigger tsvectorunaccentupdate before insert or update 
             	on post for each row execute procedure post_tsvector_unaccent_trigger();
        `)
    }

    public async down(_: QueryRunner): Promise<void> {
    }

}
