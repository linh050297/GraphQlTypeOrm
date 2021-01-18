import { Request, Response } from "express";
import { Session } from "express-session";
import { Redis } from "ioredis";

export type MyContext = {
  redis: Redis;
  req: Request & { session?: Session & { userId?: number } };
  res: Response;
};

export type errorsReturn = {
  errors: [{ field: string; message: string }];
};

