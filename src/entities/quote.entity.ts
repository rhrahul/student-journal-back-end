import {
  Entity,
  Column,
  ObjectID,
  CreateDateColumn,
  ObjectIdColumn,
} from "typeorm";

@Entity()
export default class Quote {
  @ObjectIdColumn()
  id!: ObjectID;

  @Column()
  quote!: string;

  @Column()
  author!: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
