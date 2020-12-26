
import { PostInput } from './../utils/type-graphql';
import { Resolver, Query, Arg, Mutation, Ctx, UseMiddleware, Int, FieldResolver, Root, ObjectType, Field } from "type-graphql";
import { Post, Updoot } from "../entities";
import { MyContext } from "src/types";
import { returnErrorResponse } from "./responses";
import { PostResponse } from "../utils/type-graphql";
import { isAuth } from '../middleware/isAuth';
import { getConnection } from 'typeorm';
import { createIndexSearchTitlePost } from '../elasticSearchService/indexService';

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];
    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolvers {

    @FieldResolver(() => String)
    textSnippet(
        @Root() root: Post
    ) {
        if(root.text.length > 50){
            return root.text.slice(0, 50) + "..."
        }
        return root.text
    }

    @FieldResolver(() => String)
    titleSnippet(
        @Root() root: Post
    ) {
        if(root.title.length > 50){
            return root.title.slice(0, 50) + "..."  
        }
        return root.title
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx(){ req }:MyContext
    ){
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const userId = req.session.userId;

        //không được tự vote bài viết của mình
        const postFindById = await Post.findOne({ where: { id: postId } });
        console.log('postFindById: ', postFindById);

        if(postFindById?.creatorId != userId ){
            const updoot = await Updoot.findOne({ where: { postId, userId } });
            // the user has voted on the post before
            // and they are changing their vote
            if (updoot && updoot.value !== realValue) { //nếu giá trị vote khác với giá trị đã vote
                await getConnection().transaction(async (tm)=>{
                    //update when updoot have point
                    await tm.createQueryBuilder()
                        .update(Updoot)
                        .set({ value: realValue })
                        .where("postId = :postId and userId = :userId", { postId, userId })
                        .execute();

                    //update post
                    await tm.createQueryBuilder()
                        .update(Post)
                        .set({ points: () => `points + ${realValue}` })
                        .where("id = :postId", { postId })
                        .execute();
                })

                return true;

            }else if( !updoot ){
                //has never voted before
                await getConnection().transaction(async (tm)=>{
                    await tm.createQueryBuilder()
                        .insert()
                        .into(Updoot)
                        .values([
                            { userId, postId, value: realValue }, 
                        ])
                        .execute();

                    await tm.createQueryBuilder()
                        .update(Post)
                        .set({ points: () => `points + ${realValue}` })
                        .where("id = :postId", { postId })
                        .execute();
                });

                return true;
                
            }else{
                return false;
            }

        }else{
            return false;
        }
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
        // @Info() info:any
        
    ): Promise<PaginatedPosts> {

        // console.log('info: ', info);
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const qb = getConnection()
            .getRepository(Post)
            .createQueryBuilder("p")
            .innerJoinAndSelect("p.creator", "u", 'u.id = p.creatorId')
            .orderBy('p.createdAt', 'DESC')
            .take(realLimitPlusOne)
            

        if (cursor) {
            console.log('new Date(parseInt(cursor):', new Date(parseInt(cursor)));
            qb.where('p.createdAt < :cursor', { cursor: new Date(parseInt(cursor)) });
        };

        const posts = await qb.getMany();

        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne ? true : false
        };
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', ()=> Int!) id: number,
    ): Promise<Post | undefined> {
        return Post.findOne(id, {relations: ["creator"]})
    }

    @Mutation(() => PostResponse)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<PostResponse | null> {
        if (!input.text) {
            return returnErrorResponse('text', 'Text is not be null');
        };

        if (!input.title) {
            return returnErrorResponse('title', 'Title is not be null');
        }

        let post = await Post.create({
            ...input,
            creatorId: req.session.userId
        }).save()
        return { post }
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('title', () => String, { nullable: true }) title: string,
        @Arg('text', () => String, { nullable: true }) text: string,
        @Arg('id', ()=> Int!) id: number,
    ): Promise<Post | null> {

        const post = await Post.findOne(id);
        if (!post) {
            return null;
        };

        if (post && typeof title !== 'undefined') {
            await Post.update({ id }, { title, text });
        }
        return post
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', ()=> Int!) id: number,
        @Ctx(){ req }: MyContext
    ): Promise<boolean> {
        try {

            const postFindById = await Post.findOne(id);
            const userId = req.session.userId;

            if(userId != postFindById?.creatorId){
                return false
            };

            await Post.delete(id);
            return true
            
        } catch (error) {
            console.log('error: ', error);
            return false;
        }
    }

    @Query(()=> Boolean)
    async createIndexPostTitle(
        @Arg('nameIndex', () => String) nameIndex: string
    ):Promise<Boolean>{
        try {

            let resultCreate = await createIndexSearchTitlePost(nameIndex);
            console.log('resultCreate: ', resultCreate);
            return true;

        } catch (error) {
            console.log('error: ', error);
            return false;
        }
    }

    @Query(() => [Post], { nullable: true })
    async searchPostByTitle(
        @Arg('searchString', () => String) searchString: string
    ): Promise<Post[]> {

        //slit string ra thành mảng nếu tring chứa nhiều ký tự space
        //string đã loại bỏ mọi khoảng trắng đầu cuối và giữa
        const stringArrStandardized = searchString.replace(/^\s+|\s+$|\s+(?=\s)/g, ""); 
        const stringArr = stringArrStandardized.split(" ");

        let stringTsQuery = '';
        let whereQuery = '';

        if(stringArr.length > 1){
            stringArr.forEach(str => {
                console.log('str: ', str);
                stringTsQuery += `${str}:* | `;
            });

            stringTsQuery = stringTsQuery.slice(0, -3);

        }else{
            stringTsQuery = `${stringArrStandardized}:*`;
        };

        var unaccent = searchString.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        console.log(unaccent)

        if(unaccent !== searchString){
            console.log('có dấu')
            whereQuery = `document_idx @@ to_tsquery('${stringTsQuery}')`;
        }else{
            whereQuery = `document_idx @@ to_tsquery('${stringTsQuery}') or document_idx @@ to_tsquery(unaccent(coalesce('${stringTsQuery}', '')))`;
        }

        console.log('whereQuery: ', whereQuery);

        const posts = await getConnection()
            .getRepository(Post)
            .createQueryBuilder("post")
            // .select()
            .innerJoinAndSelect("post.creator", "u", 'u.id = post.creatorId')
            .where(whereQuery)
            .orderBy(`ts_rank(document_idx, plainto_tsquery('${stringArrStandardized}'))`, 'DESC')
            .addOrderBy(`post.createdAt`, 'DESC')
            .getMany();

        return posts;
        
    }
}