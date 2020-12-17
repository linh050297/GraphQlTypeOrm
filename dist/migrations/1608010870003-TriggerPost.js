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
exports.TriggerPost1608010870003 = void 0;
class TriggerPost1608010870003 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`
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
        `);
        });
    }
    down(_) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.TriggerPost1608010870003 = TriggerPost1608010870003;
//# sourceMappingURL=1608010870003-TriggerPost.js.map