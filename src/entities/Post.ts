import { ObjectType, Field, Int } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany, AfterInsert } from "typeorm";
import { Updoot, User } from '../entities'

@ObjectType()//convert sang dạng object để dùng cho resolver graphql, gồm cả Field()
@Entity()
export class Post extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column({ nullable: true })
  text!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ type: 'text' })
  title!: string;

  @Field()
  @Column()
  creatorId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  // @Field(() => [Updoot], {nullable: true})
  @OneToMany(() => Updoot, (updoot) => updoot.post)
  updoots: Updoot[];

  @Field(()=>Int, {nullable: true})
  voteStatus: number;

  @Column("tsvector", {select: false, nullable: true}) //select = false khi query sẽ ko query trường này
  document_idx: any; // TÌM KIẾM THEO CÓ ĐẦY ĐỦ DẤU

  // @Column("tsvector", {select: false, nullable: true}) //select = false khi query sẽ ko query trường này
  // tsvector_unaccent_idx: any; //BỎ HẾT DẤU NHẰM TÌM KIẾM THEO KHÔNG DẤU

}
