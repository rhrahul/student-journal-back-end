import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import Quote from "./quote.entity";

@Entity()
export default class Entry {
  @ObjectIdColumn()
  id!: ObjectID;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  quoteId!: any;

  @Column()
  createdBy!: string;

  @Column()
  updatedBy?: string;

  @CreateDateColumn({
    type: "timestamp",
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    nullable: true,
  })
  updated_at?: Date;
}
