import { chainingEntities } from 'archmage-chaining'
import { Column, Entity } from 'typeorm'
import { HashedTable } from 'archmage-persistence'

@Entity()
export class Transactions extends HashedTable {
  @Column('integer')
  value!: number
}

@Entity()
export class PendingTransactions extends Transactions {

}

export const testEntities = [
  PendingTransactions,
  Transactions,
]

export const allEntities = chainingEntities.concat(testEntities)
