import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
    redis: Redis;
    req: Request & { session: Express.Session } ;
    res: Response;
}

export type errorsReturn = {
    errors: [{field: string, message: string}]
}