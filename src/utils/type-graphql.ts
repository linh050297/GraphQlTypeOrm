import { InputType, Field, ObjectType } from "type-graphql";
import { User, Post } from "../entities";

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
export class PostInputAddIndex {
  @Field()
  title!: string;

  @Field()
  text!: string;

  @Field()
  id!: number;

  @Field()
  createdAt: Date;

  @Field()
  points!: number;

  @Field()
  updatedAt: Date;

  @Field()
  creatorId!: number;
}
@InputType()
export class PostInputCreate {
  @Field()
  title!: string;

  @Field()
  text!: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class PostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Post, { nullable: true })
  post?: Post;
}

@ObjectType()
export class FieldErrorDocumentsPostIndex {
  @Field()
  index?: string;

  @Field()
  id!: string;

  @Field()
  result?: string;

  @Field()
  status?: number;
}

@ObjectType()
export class ErrorDocumentsResponseCreatePostIndex {
  @Field(() => [FieldErrorDocumentsPostIndex], { nullable: true })
  errors?: FieldErrorDocumentsPostIndex[];

  @Field()
  status!: boolean;
}
