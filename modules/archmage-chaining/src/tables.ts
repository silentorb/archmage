import { Hash } from 'archmage-common'
import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

// The created column should be directly added instead of inherited to a table if `created` should be part of the hash
export abstract class Created {
  @CreateDateColumn()
  createdAt!: Date
}

export abstract class HashedTable extends Created {
  @PrimaryColumn()
  hash!: Hash

  @Column({ type: 'smallint', unsigned: true, default: 1 })
  format!: number
}

@Entity()
export class HashLists extends Created {
  @PrimaryColumn()
  list!: Hash

  @PrimaryColumn()
  item!: string
}
