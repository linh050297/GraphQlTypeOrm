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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const constants_1 = require("./constants");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const resolvers_1 = require("./resolvers");
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const entities_1 = require("./entities");
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const elasticSearchConnect_1 = __importDefault(require("./utils/elasticSearchConnect"));
elasticSearchConnect_1.default.ping({
    requestTimeout: 3000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    }
    else {
        console.log('All is well');
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield typeorm_1.createConnection({
        type: "postgres",
        database: "typeormdb",
        entities: [entities_1.Post, entities_1.User, entities_1.Updoot],
        username: "postgres",
        password: "linhhz77",
        logging: true,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        synchronize: true
    });
    conn.runMigrations();
    const app = express_1.default();
    const RedisStore = connect_redis_1.default(express_session_1.default);
    const redis = new ioredis_1.default();
    app.use(cors_1.default({
        origin: 'http://localhost:3000',
        credentials: true
    }));
    redis.on('ready', () => {
        console.log('Redis is ready to work.....');
    });
    app.use(express_session_1.default({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: 'lax',
            secure: constants_1.__prod__
        },
        secret: 'airoicungkhac',
        resave: false,
        saveUninitialized: false
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [resolvers_1.HelloResolvers, resolvers_1.PostResolvers, resolvers_1.UserResolvers],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis })
    });
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(4000, () => {
        console.log('App is listening on  localhost:4000');
    });
});
main().catch((error) => {
    console.log(error);
});
;
//# sourceMappingURL=index.js.map