import { validateRegister } from './../utils/validates/validateUserRegister';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from './../constants';
import { MyContext } from './../types';

import { Resolver, Query, Mutation, Arg, Ctx, Int, FieldResolver, Root } from "type-graphql";
import argon2 from 'argon2';//hash password
import { returnErrorResponse } from './responses';
import { UserResponse } from '../utils/type-graphql'
import { UsernameAndPasswordInput } from '../utils/type-graphql';
import { sendEmail } from '../utils/sendMail';
import { v4 } from 'uuid';
import { User } from '../entities'
import { getConnection } from 'typeorm';

@Resolver(User)
export class UserResolvers {

    @FieldResolver(() => String)
    email(
        @Root() user: User,
        @Ctx() {req}: MyContext
    ){
        //this is the current user and it's ok to show them their own email
        if(req.session.userId === user.id){
            return user.email;
        };
        //currwnt user wants to see someone else email
        return "";
    }

    @Query(()=> User, { nullable: true })
    async me(
        @Ctx() { req }: MyContext
    ): Promise<User | null>{
        //not log in
        if(!req.session.userId){
            return null
        }
        const user = await User.findOne(req.session.userId);
        if(!user){
            return null;
        }
        return user;
    };

    //change password with token
    @Mutation(()=>UserResponse)
    async changePasswordFromToken(
        @Arg('newPassword') newPassword: string,
        @Arg('token') token: string,
        @Ctx() { redis, req }: MyContext
    ):Promise<UserResponse>{
        try {

            if(newPassword.length < 6){
                return returnErrorResponse('newPassword','New password too short')
            }
            //get user id from redis
            let tokenKeyRedis = FORGET_PASSWORD_PREFIX + token;
            let userId = await redis.get(tokenKeyRedis);
            if(!userId){
                return returnErrorResponse('token','Token is wrong or expired');
            }      

            const user = await User.findOne({ id: +userId });
            console.log('user: ', user);

            if(!user){
                return returnErrorResponse('token','User no longer exist');
            };

            const hashedPassword = await argon2.hash(newPassword);

            await User.update({id: +userId}, {password: hashedPassword});

            req.session.userId = user.id;
            await redis.del(tokenKeyRedis); 

            return {user};

        } catch (error) {
            console.log('error changePasswordFromToken: ', error);
            return returnErrorResponse('newPassword',error.message);
        }
    }

    //forgot password
    @Mutation(()=> Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {redis}: MyContext
    ){
        try {
            const user = await User.findOne( email );
            console.log('user: ', user);
            if(!user || !user.email){
                console.log('true');
                return true
            }

            const token = await v4();
            await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'EX', 1000*60*60*24*3) //3 days

            let link = `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`;

            await sendEmail( user.email, link );
            
            return true
        } catch (error) {
            console.log('error: ', error);
            return true
        }
        
    }

    //đăng ký tài khoản
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernameAndPasswordInput,
        @Ctx() {req}: MyContext
    ): Promise<UserResponse | null>{
        try {

            //check input value
            let resultValidateInput = validateRegister(options);
            if(resultValidateInput){
                return resultValidateInput
            }
            
            const hashedPassword = await argon2.hash(options.password);
            //kiểu 1
            // User.create({username: options.username,password: hashedPassword,email: options.email}).save();
            
            //kiểu 2
            const result = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values([
                {username: options.username,password: hashedPassword,email: options.email}
            ])
            .returning('*')
            .execute();

            if(result){
                console.log('result: ', result.raw[0]);
                req.session.userId = result.raw[0].id;
                return result.raw[0] 
            }else{
                return null
            }
        } catch (error) {
            console.log('error: ', error);
            if(error.code == 23505){
                return returnErrorResponse('username', "Username is already exists");
            }
            console.log('error: ', error.message);
            return returnErrorResponse('general', error.message);
        }
        
    };

    //lấy danh sách các user
    @Query(() => [User])
    async getAllUser():Promise<User[]>{
        const users = await User.find();
        return users;
    };

    //lấy user theo id
    @Query(() => User, { nullable: true })
    async getUser( 
        @Arg('id', ()=> Int) id: number,
    ): Promise<User | null>{
        let userFindOne = await User.findOne(id);
        if(userFindOne){
            return userFindOne
        }
        return null;
    };

    //login
    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext
    ):Promise<UserResponse>{
        const user = await User.findOne(
            usernameOrEmail.includes('@') ? 
            { where: {email: usernameOrEmail} } : 
            { where:{username: usernameOrEmail} }
        );
        if(!user){
            return returnErrorResponse('usernameOrEmail', "Username do not exist!");
        }
        const valid = await argon2.verify(user.password, password);
        if(!valid){
            return returnErrorResponse('password', "Wrong password!");
        };

        req.session.userId = user.id;

        return { user }; 
    };

    //logout
    @Mutation(() => Boolean)
    async logout(
        @Ctx() { req, res }: MyContext
    ):Promise<boolean>{
        
        return new Promise( (resolve) =>{
            req.session.destroy((err) =>{
                res.clearCookie(COOKIE_NAME);
                if(err){
                    resolve(false)
                    return
                }
                resolve(true)
            });
        }) 
    };

    //find by email
    @Query(() => [User], { nullable: true })
    async findByEmail(
        @Arg('email') email: string,
    ):Promise<User[] | null>{

        const user = await User.findByEmail(email)
        console.log('user: ', user);

        if(!user){
            return null
        }

        return user; 
    };

}