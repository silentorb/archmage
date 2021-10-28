import { Column, Entity } from 'typeorm'
import { Block } from './types'
import { HashedTable, hashingEntities } from 'archmage-persistence'

@Entity()
export class Blocks extends HashedTable implements Block {
  @Column('integer')
  number!: number

  @Column()
  content!: string // Hash

  @Column({ nullable: true })
  previous?: string // Hash

  @Column()
  timestamp!: Date
}

export const chainingEntities: any[] = hashingEntities.concat(
  [
    Blocks,
  ]
)
