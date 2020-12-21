import {MigrationInterface, QueryRunner} from "typeorm";

export class DocumentSetweight1608261919975 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE EXTENSION unaccent;
            -- alter table post add column document_idx tsvector;
            update post set document_idx = setweight(to_tsvector( coalesce(title, '')),'A') || setweight(to_tsvector(unaccent(coalesce(title, ''))),'B');
            create index document_idx on post using gin (document_idx);

            --trigger *********
            CREATE OR REPLACE FUNCTION post_tsvector_unaccent_trigger() returns trigger as $$
             begin
                new.document_idx := setweight(to_tsvector( coalesce(new.title, '')),'A') || setweight(to_tsvector(unaccent(coalesce(new.title, ''))),'B');
             	return new;
             end
            $$ LANGUAGE plpgsql;

             create trigger tsvectorunaccentupdate before insert or update 
             	on post for each row execute procedure post_tsvector_unaccent_trigger();
        `)
    }

    public async down(_: QueryRunner): Promise<void> {
    }

//     select * , ts_rank(document_idx, plainto_tsquery('dắ chau')) from post where 
//     document_idx @@ to_tsquery('dắ:* & chau:*')
//     -- document_idx @@ to_tsquery(unaccent('dat:* & chau:*'))
//         order by ts_rank(document_idx, plainto_tsquery('dắ chau')) desc;
}

// create extension pg_trgm
