import { Blocks, HashedTable } from './schema'
import { getListHash, insertHashedRecord, insertHashListWithHash } from './writing'
import {
  Database,
  executeTransaction, getManyBy,
  getSingleBy, insertSingle,
  newQueryBuilder,
  Operation,
  queryStringValues
} from '../persistence'
import { ObjectType } from 'typeorm'
import { Hash, WithoutHash } from '../common'
import { Block } from './types'
import { hashRecord } from './serialization'

export const insertBlock = insertHashedRecord(Blocks)
export const insertHashedBlock = insertSingle(Blocks)

export const getBlocksBy = getManyBy(Blocks)

export type GetHashes = (db: Database) => Promise<string[]>
export type HashedTables = Array<ObjectType<HashedTable>>
export type TableNames = string[]

export function getTableNames(db: Database, tables: HashedTables): string[] {
  return tables.map(table => db.getMetadata(table).tableName)
}

export function getHashesFromTables(tables: TableNames): GetHashes {
  const clauses = tables.map(table => `SELECT "hash" FROM "${table}"`)
  const clause = clauses.join('\nUNION\n')
  const sql = `${clause}\nORDER BY hash`
  return db => queryStringValues(db, sql)
}

export async function prepareNextBlock(db: Database, content: Hash, timestamp: Date = new Date()): Promise<Block> {
  const previousBlock = await newQueryBuilder(db, Blocks)
    .orderBy('number', 'DESC')
    .getOne()

  const number = (previousBlock?.number || 0) + 1
  const previous = previousBlock?.hash

  const body: WithoutHash<Block> = {
    format: 1,
    number,
    previous,
    content,
    timestamp,
  }

  const hash = hashRecord(Blocks)(db)(body)
  return {
    hash,
    ...body,
  }
}

// export function copyRecords(db: Database, source: ObjectType<any>, destination: ObjectType<any>, hashes: string[]) {
//   return newQueryBuilder(db, destination)
//     // .insert()
//     // .values(query =>
//     //   query
//     //     .select(source)
//     //     // .where()
//     // )
//     // .execute()
//     .insert()
//     .into(destination)
//     // .select()
//     .from(source, 'source')
//     .where(`"${db.getRepository(source).metadata.tableName}"."hash" in (:...hashes)`, { hashes: hashes })
//     .execute()
// }

export type TablePair = [ObjectType<any>, ObjectType<any>]

export async function integratePendingItems(db: Database, tablePairs: TablePair[]) {
  const pendingTables = tablePairs.map(pair => pair[0])
  const tableNames = getTableNames(db, pendingTables)
  const hashes = await getHashesFromTables(tableNames)(db)
  if (hashes.length == 0) return

  // const recordGroups = Promise.all(pendingTables.map(async table => [table, await getManyBy(table)]))

  const content = getListHash(hashes)

  // const itemCopies: Operation[] = tablePairs
  //   .map(pair => db => copyRecords(db, pair[0], pair[1], hashes))

  const hashListInserts: Operation = db => insertHashListWithHash(db, content, hashes)
  const block = await prepareNextBlock(db, content)
  const blockInsert: Operation = db => insertHashedBlock(db, block)

  const deletions: Operation[] = tablePairs
    .map(pair =>
      db => newQueryBuilder(db, pair[0])
        .delete()
        .where(`"hash" in (:...hashes)`, { hashes: hashes })
        .execute()
    )

  const statements =
    []
      .concat([blockInsert, hashListInserts])
      .concat(deletions)

  await executeTransaction(db, statements)
}
