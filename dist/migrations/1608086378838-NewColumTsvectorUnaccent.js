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
exports.NewColumTsvectorUnaccent1608086378838 = void 0;
class NewColumTsvectorUnaccent1608086378838 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`
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
        `);
        });
    }
    down(_) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.NewColumTsvectorUnaccent1608086378838 = NewColumTsvectorUnaccent1608086378838;
//# sourceMappingURL=1608086378838-NewColumTsvectorUnaccent.js.map