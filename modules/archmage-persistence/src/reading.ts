import { ObjectType, SelectQueryBuilder } from 'typeorm'
import { Database } from './types'
import { RawSqlResultsToEntityTransformer } from 'typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer'

export function newQueryBuilder<T = any>(db: Database, table: ObjectType<T>): SelectQueryBuilder<T> {
  const metadata = db.getMetadata(table)
  return db.getRepository(table).createQueryBuilder(metadata.tableName)
}


export function formatQueryResults<T>(table: ObjectType<T>, db: Database, records: any[]): T[] {
  const queryBuilder = newQueryBuilder(db, table)
  const queryRunner = (queryBuilder as any).queryRunner
  const transformer = new RawSqlResultsToEntityTransformer(
    queryBuilder.expressionMap,
    queryBuilder.connection.driver,
    [], [], queryRunner) as any

  const aliasPrefix = queryBuilder.expressionMap.mainAlias!.tablePath + '_'
  const newRecords = records.map(record => {
      const temp = Object.entries(record).reduce((a, b) => ({ ...a, [aliasPrefix + b[0]]: b[1] }), {})
      return transformer.transformRawResultsGroup([temp], queryBuilder.expressionMap.mainAlias!)
    }
  )
  return newRecords as any
}

export async function queryFormatted<T>(table: ObjectType<T>, db: Database, sql: string, args: any): Promise<T[]> {
  const records = await db.query(sql, args)
  return formatQueryResults(table, db, records)
}
