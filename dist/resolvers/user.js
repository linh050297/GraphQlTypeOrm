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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolvers = void 0;
const validateUserRegister_1 = require("./../utils/validates/validateUserRegister");
const constants_1 = require("./../constants");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const responses_1 = require("./responses");
const type_graphql_2 = require("../utils/type-graphql");
const type_graphql_3 = require("../utils/type-graphql");
const sendMail_1 = require("../utils/sendMail");
const uuid_1 = require("uuid");
const entities_1 = require("../entities");
const typeorm_1 = require("typeorm");
let UserResolvers = class UserResolvers {
    email(user, { req }) {
        if (req.session.userId === user.id) {
            return user.email;
        }
        ;
        return "";
    }
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            const user = yield entities_1.User.findOne(req.session.userId);
            if (!user) {
                return null;
            }
            return user;
        });
    }
    ;
    changePasswordFromToken(newPassword, token, { redis, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (newPassword.length < 6) {
                    return responses_1.returnErrorResponse('newPassword', 'New password too short');
                }
                let tokenKeyRedis = constants_1.FORGET_PASSWORD_PREFIX + token;
                let userId = yield redis.get(tokenKeyRedis);
                if (!userId) {
                    return responses_1.returnErrorResponse('token', 'Token is wrong or expired');
                }
                const user = yield entities_1.User.findOne({ id: +userId });
                console.log('user: ', user);
                if (!user) {
                    return responses_1.returnErrorResponse('token', 'User no longer exist');
                }
                ;
                const hashedPassword = yield argon2_1.default.hash(newPassword);
                yield entities_1.User.update({ id: +userId }, { password: hashedPassword });
                req.session.userId = user.id;
                yield redis.del(tokenKeyRedis);
                return { user };
            }
            catch (error) {
                console.log('error changePasswordFromToken: ', error);
                return responses_1.returnErrorResponse('newPassword', error.message);
            }
        });
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield entities_1.User.findOne(email);
                console.log('user: ', user);
                if (!user || !user.email) {
                    console.log('true');
                    return true;
                }
                const token = yield uuid_1.v4();
                yield redis.set(constants_1.FORGET_PASSWORD_PREFIX + token, user.id, 'EX', 1000 * 60 * 60 * 24 * 3);
                let link = `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`;
                yield sendMail_1.sendEmail(user.email, link);
                return true;
            }
            catch (error) {
                console.log('error: ', error);
                return true;
            }
        });
    }
    register(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let resultValidateInput = validateUserRegister_1.validateRegister(options);
                if (resultValidateInput) {
                    return resultValidateInput;
                }
                const hashedPassword = yield argon2_1.default.hash(options.password);
                const result = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(entities_1.User)
                    .values([
                    { username: options.username, password: hashedPassword, email: options.email }
                ])
                    .returning('*')
                    .execute();
                if (result) {
                    console.log('result: ', result.raw[0]);
                    req.session.userId = result.raw[0].id;
                    return result.raw[0];
                }
                else {
                    return null;
                }
            }
            catch (error) {
                console.log('error: ', error);
                if (error.code == 23505) {
                    return responses_1.returnErrorResponse('username', "Username is already exists");
                }
                console.log('error: ', error.message);
                return responses_1.returnErrorResponse('general', error.message);
            }
        });
    }
    ;
    getAllUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield entities_1.User.find();
            return users;
        });
    }
    ;
    getUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let userFindOne = yield entities_1.User.findOne(id);
            if (userFindOne) {
                return userFindOne;
            }
            return null;
        });
    }
    ;
    login(usernameOrEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield entities_1.User.findOne(usernameOrEmail.includes('@') ?
                { where: { email: usernameOrEmail } } :
                { where: { username: usernameOrEmail } });
            if (!user) {
                return responses_1.returnErrorResponse('usernameOrEmail', "Username do not exist!");
            }
            const valid = yield argon2_1.default.verify(user.password, password);
            if (!valid) {
                return responses_1.returnErrorResponse('password', "Wrong password!");
            }
            ;
            req.session.userId = user.id;
            return { user };
        });
    }
    ;
    logout({ req, res }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                req.session.destroy((err) => {
                    res.clearCookie(constants_1.COOKIE_NAME);
                    if (err) {
                        resolve(false);
                        return;
                    }
                    resolve(true);
                });
            });
        });
    }
    ;
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield entities_1.User.findByEmail(email);
            console.log('user: ', user);
            if (!user) {
                return null;
            }
            return user;
        });
    }
    ;
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entities_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolvers.prototype, "email", null);
__decorate([
    type_graphql_1.Query(() => entities_1.User, { nullable: true }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => type_graphql_2.UserResponse),
    __param(0, type_graphql_1.Arg('newPassword')),
    __param(1, type_graphql_1.Arg('token')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "changePasswordFromToken", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg('email')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "forgotPassword", null);
__decorate([
    type_graphql_1.Mutation(() => type_graphql_2.UserResponse),
    __param(0, type_graphql_1.Arg('options')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [type_graphql_3.UsernameAndPasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "register", null);
__decorate([
    type_graphql_1.Query(() => [entities_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "getAllUser", null);
__decorate([
    type_graphql_1.Query(() => entities_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "getUser", null);
__decorate([
    type_graphql_1.Mutation(() => type_graphql_2.UserResponse),
    __param(0, type_graphql_1.Arg('usernameOrEmail')),
    __param(1, type_graphql_1.Arg('password')),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "logout", null);
__decorate([
    type_graphql_1.Query(() => [entities_1.User], { nullable: true }),
    __param(0, type_graphql_1.Arg('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "findByEmail", null);
UserResolvers = __decorate([
    type_graphql_1.Resolver(entities_1.User)
], UserResolvers);
exports.UserResolvers = UserResolvers;
//# sourceMappingURL=user.js.map