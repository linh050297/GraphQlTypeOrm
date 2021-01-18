import { PostInputAddIndex } from "./../utils/type-graphql";
import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType() //convert sang dạng object để dùng cho resolver graphql, gồm cả Field()
@Entity()
export class ElasticSync extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: "text" })
  nameIndex!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [PostInputAddIndex])
  @Column({
    type: "jsonb",
    array: false,
    // default: () => "'[]'",
    nullable: false,
  })
  data!: PostInputAddIndex[];

  @Field()
  @Column({ default: false })
  isSync!: boolean;
  

  
}
