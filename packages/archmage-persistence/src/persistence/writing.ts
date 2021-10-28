import { ObjectType, UpdateResult } from 'typeorm'
import { BaseRecord, Database } from './types'

export function insertMany<T>(table: ObjectType<T>): (db: Database, records: T[]) => Promise<UpdateResult> {
  return async (db, records) => {
    if (records.length == 0) {
      return {
        raw: {},
        generatedMaps: [],
      }
    }

    return db
      .getRepository(table)
      .createQueryBuilder()
      .insert()
      .values(records)
      .execute()
  }
}

export function insertSingle<T>(table: ObjectType<T>): (db: Database, record: BaseRecord<T>) => Promise<UpdateResult> {
  return (db, record) => db.getRepository(table).insert(record as any)
}

export function insertImmutable<T>(table: ObjectType<T>, db: Database, entries: T | T[]): Promise<T> {
  const [sql, parameters] = db
    .createQueryBuilder()
    .insert()
    .into(table)
    .values(entries)
    .getQueryAndParameters()
  return db.query(`${sql} ON CONFLICT DO NOTHING`, parameters)
}

export type Operation = (db: Database) => Promise<any>

export async function executeTransaction(db: Database, operations: Operation[]) {
  const queryRunner = db.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    for (const operation of operations) {
      await operation(db)
    }
    await queryRunner.commitTransaction()
  } catch (error) {
    await queryRunner.rollbackTransaction()
    throw error
  } finally {
    await queryRunner.release()
  }
}
