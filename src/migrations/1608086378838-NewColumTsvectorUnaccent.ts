import {MigrationInterface, QueryRunner} from "typeorm";

export class NewColumTsvectorUnaccent1608086378838 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            alter table post add column tsvector_unaccent_idx tsvector;
            update post set tsvector_unaccent_idx = to_tsvector(unaccent(coalesce(title, '')));
            create index tsvector_unaccent_idx on post using gin (tsvector_unaccent_idx);

            --trigger *********
             create function post_tsvector_unaccent_trigger() returns trigger as $$
             begin
                new.tsvector_unaccent_idx :=
             	to_tsvector(unaccent(coalesce(new.title, '')));
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
