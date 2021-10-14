import { Column, ColumnOptions, CreateDateColumn, Entity, PrimaryColumn, ValueTransformer } from 'typeorm'
import { Block } from './types'
import { DoNotHash } from './serialization'

const smallInt: ColumnOptions = { type: 'smallint', unsigned: true }

// There is a bug with TypeOrm where transformers are not called when they are defined in a separate file :(
// Make sure to keep all type ValueTransformers in the same schema.ts file.
export const numericTransformer: ValueTransformer = {
  to: value => value,
  from: value => typeof value === 'string'
    ? parseFloat(value)
    : typeof value === 'number'
      ? value
      : undefined
}

const numeric: ColumnOptions = {
  type: 'numeric',
  transformer: numericTransformer,
}

// The created column should be directly added instead of inherited to a table if `created` should be part of the hash
export abstract class Created {
  @DoNotHash()
  @CreateDateColumn()
  created!: Date
}

export abstract class HashedTable extends Created {
  @PrimaryColumn()
  hash!: string // Hash

  @Column({ type: 'smallint', unsigned: true, default: 1 })
  format!: number
}

@Entity()
export class HashLists extends Created {
  @PrimaryColumn()
  list!: string // Hash

  @PrimaryColumn()
  item!: string
}

@Entity()
export class Blocks extends HashedTable implements Block {
  @Column('integer')
  number!: number

  @Column()
  content!: string // Hash

  @Column({ nullable: true })
  previous?: string // Hash

  @Column()
  timestamp: Date
}

export const chainingEntities: any[] = [
  Blocks,
  HashLists,
]
