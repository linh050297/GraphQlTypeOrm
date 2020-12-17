import { ObjectType, Field, Int } from "type-graphql";
import { Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { Post, User } from '../entities'

//many to many relationship
// user <-> posts
// user -> join table <- posts
// user -> updoot table <- posts


@ObjectType()//convert sang dạng object để dùng cho resolver graphql, gồm cả Field()
@Entity()
export class Updoot extends BaseEntity {
    
    // @Field(() => Int, {nullable: true})
    @Column({type: "int"})
    value: number;

    // @Field(() => Int)
    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, (user) => user.updoots)
    user: User;

    // @Field(() => Int)
    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, (post) => post.updoots)
    post: Post;

    // @Field(() => Int, { nullable: true })
    // @Column({type: "int"})
    // voteStatus: number | null; // 1 or -1 or null

}
