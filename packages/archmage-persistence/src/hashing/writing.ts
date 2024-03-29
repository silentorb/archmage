import { ObjectType } from 'typeorm'
import { hashRecord } from './serialization'
import { HashLists } from './schema'
import { bufferFromStringArray, Hash, hashString, WithoutHash } from '../common'
import { BaseHashRecord, Database, insertImmutable } from '../persistence'

export function insertHashedRecords<T extends { hash: Hash }>(
  table: ObjectType<T>
): (db: Database, entries: Array<WithoutHash<T>>) => Promise<T[]> {
  const localHashRecord = hashRecord(table)
  return async (db, entries) => {
    const array = entries.map(e => ({ ...e, hash: localHashRecord(db)(e) }))
    await insertImmutable(table, db, array as any)
    return array as any
  }
}

export function insertHashedRecord<T>(table: ObjectType<T>): (db: Database, data: BaseHashRecord<T>) => Promise<T> {
  const insert = insertHashedRecords(table)
  return async (db, data) => {
    const array = await insert(db, [data])
    return array[0] as any
  }
}

export function getListHash(items: Hash[]): string {
  return hashString(bufferFromStringArray(items.sort()))
}

export async function insertHashListWithHash(db: Database, hash: Hash, items: Hash[]): Promise<Hash> {
  const inserts = items
    .map(itemHash => ({
      list: hash,
      item: itemHash,
    }))

  await insertImmutable<{ list: Hash; item: Hash }>(HashLists, db, inserts)

  return hash
}

export async function insertHashList(db: Database, items: Hash[]): Promise<Hash> {
  const hash = getListHash(items)
  return insertHashListWithHash(db, hash, items)
}
