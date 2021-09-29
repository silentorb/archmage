import { ObjectType } from 'typeorm'
import { Database } from './types'

export function insertImmutable<T>(table: ObjectType<T>, db: Database, entries: T | T[]): Promise<T> {
  const [sql, parameters] = db
    .createQueryBuilder()
    .insert()
    .into(table)
    .values(entries)
    .getQueryAndParameters()
  return db.query(`${sql} ON CONFLICT DO NOTHING`, parameters)
}
