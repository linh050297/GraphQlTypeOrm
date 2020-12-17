"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.PostResolvers = void 0;
const type_graphql_1 = require("./../utils/type-graphql");
const type_graphql_2 = require("type-graphql");
const entities_1 = require("../entities");
const responses_1 = require("./responses");
const type_graphql_3 = require("../utils/type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const typeorm_1 = require("typeorm");
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    type_graphql_2.Field(() => [entities_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "posts", void 0);
__decorate([
    type_graphql_2.Field(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    type_graphql_2.ObjectType()
], PaginatedPosts);
let PostResolvers = class PostResolvers {
    textSnippet(root) {
        if (root.text.length > 50) {
            return root.text.slice(0, 50) + "...";
        }
        return root.text;
    }
    titleSnippet(root) {
        if (root.title.length > 50) {
            return root.title.slice(0, 50) + "...";
        }
        return root.title;
    }
    vote(postId, value, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUpdoot = value !== -1;
            const realValue = isUpdoot ? 1 : -1;
            const userId = req.session.userId;
            const postFindById = yield entities_1.Post.findOne({ where: { id: postId } });
            console.log('postFindById: ', postFindById);
            if ((postFindById === null || postFindById === void 0 ? void 0 : postFindById.creatorId) != userId) {
                const updoot = yield entities_1.Updoot.findOne({ where: { postId, userId } });
                if (updoot && updoot.value !== realValue) {
                    yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                        yield tm.createQueryBuilder()
                            .update(entities_1.Updoot)
                            .set({ value: realValue })
                            .where("postId = :postId and userId = :userId", { postId, userId })
                            .execute();
                        yield tm.createQueryBuilder()
                            .update(entities_1.Post)
                            .set({ points: () => `points + ${realValue}` })
                            .where("id = :postId", { postId })
                            .execute();
                    }));
                    return true;
                }
                else if (!updoot) {
                    yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                        yield tm.createQueryBuilder()
                            .insert()
                            .into(entities_1.Updoot)
                            .values([
                            { userId, postId, value: realValue },
                        ])
                            .execute();
                        yield tm.createQueryBuilder()
                            .update(entities_1.Post)
                            .set({ points: () => `points + ${realValue}` })
                            .where("id = :postId", { postId })
                            .execute();
                    }));
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        });
    }
    posts(limit, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const qb = typeorm_1.getConnection()
                .getRepository(entities_1.Post)
                .createQueryBuilder("p")
                .innerJoinAndSelect("p.creator", "u", 'u.id = p.creatorId')
                .orderBy('p.createdAt', 'DESC')
                .take(realLimitPlusOne);
            if (cursor) {
                console.log('new Date(parseInt(cursor):', new Date(parseInt(cursor)));
                qb.where('p.createdAt < :cursor', { cursor: new Date(parseInt(cursor)) });
            }
            ;
            const posts = yield qb.getMany();
            return {
                posts: posts.slice(0, realLimit),
                hasMore: posts.length === realLimitPlusOne ? true : false
            };
        });
    }
    post(id) {
        return entities_1.Post.findOne(id, { relations: ["creator"] });
    }
    createPost(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!input.text) {
                return responses_1.returnErrorResponse('text', 'Text is not be null');
            }
            ;
            if (!input.title) {
                return responses_1.returnErrorResponse('title', 'Title is not be null');
            }
            let post = yield entities_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId })).save();
            return { post };
        });
    }
    updatePost(title, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield entities_1.Post.findOne(id);
            if (!post) {
                return null;
            }
            ;
            if (post && typeof title !== 'undefined') {
                yield entities_1.Post.update({ id }, { title });
            }
            return post;
        });
    }
    deletePost(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postFindById = yield entities_1.Post.findOne(id);
                const userId = req.session.userId;
                if (userId != (postFindById === null || postFindById === void 0 ? void 0 : postFindById.creatorId)) {
                    return false;
                }
                ;
                yield entities_1.Post.delete(id);
                return true;
            }
            catch (error) {
                console.log('error: ', error);
                return false;
            }
        });
    }
    searchPostByTitle(searchString) {
        return __awaiter(this, void 0, void 0, function* () {
            const stringArr = searchString.split(" ");
            let stringTsQuery = '';
            let whereQuery = '';
            if (stringArr.length > 1) {
                stringArr.forEach(str => {
                    console.log('str: ', str);
                    stringTsQuery += `${str}:* & `;
                });
                stringTsQuery = stringTsQuery.slice(0, -2);
            }
            else {
                stringTsQuery = `${searchString}:*`;
            }
            ;
            whereQuery = `  document_idx @@ to_tsquery('${stringTsQuery}') or
                        document_idx @@ to_tsquery(unaccent('${stringTsQuery}'))
                        order by ts_rank(document_idx, plainto_tsquery('${searchString}')) desc`;
            console.log('whereQuery: ', whereQuery);
            const posts = yield typeorm_1.getConnection()
                .getRepository(entities_1.Post)
                .createQueryBuilder("post")
                .innerJoinAndSelect("post.creator", "u", 'u.id = post.creatorId')
                .where(whereQuery)
                .getMany();
            console.log('posts: ', posts);
            return posts;
        });
    }
};
__decorate([
    type_graphql_2.FieldResolver(() => String),
    __param(0, type_graphql_2.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolvers.prototype, "textSnippet", null);
__decorate([
    type_graphql_2.FieldResolver(() => String),
    __param(0, type_graphql_2.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.Post]),
    __metadata("design:returntype", void 0)
], PostResolvers.prototype, "titleSnippet", null);
__decorate([
    type_graphql_2.Mutation(() => Boolean),
    type_graphql_2.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_2.Arg('postId', () => type_graphql_2.Int)),
    __param(1, type_graphql_2.Arg('value', () => type_graphql_2.Int)),
    __param(2, type_graphql_2.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolvers.prototype, "vote", null);
__decorate([
    type_graphql_2.Query(() => PaginatedPosts),
    __param(0, type_graphql_2.Arg('limit', () => type_graphql_2.Int)),
    __param(1, type_graphql_2.Arg('cursor', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolvers.prototype, "posts", null);
__decorate([
    type_graphql_2.Query(() => entities_1.Post, { nullable: true }),
    __param(0, type_graphql_2.Arg('id', () => type_graphql_2.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolvers.prototype, "post", null);
__decorate([
    type_graphql_2.Mutation(() => type_graphql_3.PostResponse),
    type_graphql_2.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_2.Arg('input')),
    __param(1, type_graphql_2.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [type_graphql_1.PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolvers.prototype, "createPost", null);
__decorate([
    type_graphql_2.Mutation(() => entities_1.Post, { nullable: true }),
    __param(0, type_graphql_2.Arg('title', () => String, { nullable: true })),
    __param(1, type_graphql_2.Arg('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PostResolvers.prototype, "updatePost", null);
__decorate([
    type_graphql_2.Mutation(() => Boolean),
    type_graphql_2.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_2.Arg('id', () => type_graphql_2.Int)),
    __param(1, type_graphql_2.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolvers.prototype, "deletePost", null);
__decorate([
    type_graphql_2.Query(() => [entities_1.Post], { nullable: true }),
    __param(0, type_graphql_2.Arg('searchString', () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostResolvers.prototype, "searchPostByTitle", null);
PostResolvers = __decorate([
    type_graphql_2.Resolver(entities_1.Post)
], PostResolvers);
exports.PostResolvers = PostResolvers;
//# sourceMappingURL=post.js.map