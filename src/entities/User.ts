import { ObjectType, Field, InputType } from "type-graphql";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import {Post, Updoot} from '../entities'

@ObjectType()//convert sang dạng object để dùng cho resolver graphq, gồm cả Field()
@Entity()
export class User extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(()=> String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(()=> String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  //không có trường field là không cho người dùng select password
  @Column()
  password!: string;

  @OneToMany(() => Post, post => post.creatorId)
  posts: Post[];

  @OneToMany(() => Updoot, updoot => updoot.user)
  updoots: Updoot[];

  //static function
  static findByEmail(email: string) {
    return this.createQueryBuilder("user")
      .where("user.email like :email", { email: `%${email}%` })
      .getMany()
  }

}