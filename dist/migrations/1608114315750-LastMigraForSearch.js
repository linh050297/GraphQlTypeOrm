"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastMigraForSearch1608114315750 = void 0;
class LastMigraForSearch1608114315750 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`
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
        `);
        });
    }
    down(_) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.LastMigraForSearch1608114315750 = LastMigraForSearch1608114315750;
//# sourceMappingURL=1608114315750-LastMigraForSearch.js.map