
import "reflect-metadata";
import { __prod__, COOKIE_NAME } from './constants';
import helmet from "helmet";
// import { MikroORM } from "@mikro-orm/core";
// import microConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolvers, HelloResolvers, UserResolvers } from "./resolvers";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';
import { Post, User, Updoot } from './entities';
import {createConnection} from 'typeorm';
import path from 'path';


const main = async () => {

  const conn = await createConnection({
    type: "postgres",
    database: "typeormdb",
    entities: [Post, User, Updoot],
    username: "postgres",
    password: "linhhz77",
    logging: true,
    migrations:[path.join(__dirname, "./migrations/*")] ,
    synchronize: true //just use in development
  });

  conn.runMigrations();

  //await Post.delete({});

  // const orm = await MikroORM.init(microConfig); //connect to database
  // // await orm.em.nativeDelete(User, {}); //delete all User table
  // await orm.getMigrator().up(); //run migration

  const app = express();
  // app.use(helmet());

  const RedisStore = connectRedis(session);
  const redis = new Redis();


  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }))
  

  redis.on('ready', () => {
    console.log('Redis is ready to work.....');
  })

  //#1: tạo cookie lưu vào redis dạng key-value
  //#2: express-sesstion set cookie cho browser
  //#3: khi người dùng request thì gửi cookie đó cho server
  //#4: decrypt cookie ra key
  //#5: với key có được tìm trong redis -> lấy được dữ liệu (value) đã lưu theo keyValue

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true //option disable ttl(time to live of session)
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__//only works in https
      },
      secret: 'airoicungkhac',
      resave: false,
      saveUninitialized: false
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolvers, PostResolvers, UserResolvers],
      validate: false
    }),
    context: ({ req, res }) => ({ req, res, redis })
  })

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log('App is listening on  localhost:4000');
  })
}

main().catch((error) => {
  console.log(error);
});;
