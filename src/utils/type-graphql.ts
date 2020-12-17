
import { InputType, Field , ObjectType} from "type-graphql";
import { User, Post } from '../entities';

@InputType()
export class UsernameAndPasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
    @Field()
    email: string;
}

@InputType()
export class PostInput {
    @Field()
    title!: string;
    @Field()
    text!: string;
}


@ObjectType()
class FieldError{
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
export class UserResponse{
    @Field(()=> [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(()=> User, { nullable: true })
    user?: User
}

@ObjectType()
export class PostResponse{
    @Field(()=> [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(()=> Post, { nullable: true })
    post?: Post
}