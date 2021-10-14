import { Database, getManyBy, insertHashedRecord } from 'archmage-chaining'
import { Connection, ConnectionOptions, createConnection, EntitySchema, LoggerOptions } from 'typeorm'
import * as path from 'path'
import { allEntities, PendingTransactions } from './schema'

export function loadDotEnv() {
  require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') })
}

/*** clearDatabase should never be used in production!!! ***/
export async function clearDatabase(db: Connection, entities: EntitySchema[]) {
  return Promise.all(entities.map(async entity => {
    const meta = db.getMetadata(entity)
    return meta.tableType == 'regular'
      ? db.getRepository(entity).query(`TRUNCATE "${meta.tableName}" CASCADE`)
      : undefined
  }))
}

export function loadDatabaseLoggingConfig(env: any = process.env): LoggerOptions {
  const logs = env.DATABASE_LOGS || ''
  return logs.split(',')
}

export function loadDatabaseConnectionConfig(env: any = process.env): ConnectionOptions {
  // The lowercase variable names are deprecated
  return {
    type: env.DATABASE_TYPE || 'postgres',
    host: env.DATABASE_HOST || env.databaseHost,
    username: env.DATABASE_USERNAME || env.databaseUsername,
    password: env.DATABASE_PASSWORD || env.databasePassword,
    database: env.DATABASE_NAME,
    schema: env.DATABASE_SCHEMA,
    logging: loadDatabaseLoggingConfig(env),
    maxQueryExecutionTime: env.DATABASE_MAX_QUERY_TIME || undefined
  }
}

export function initializeTestDatabaseConnection(entities: EntitySchema[]): Promise<Database> {
  loadDotEnv()
  const connectionConfig = loadDatabaseConnectionConfig()

  // Inject database structural modification into the configuration
  // This is intended only for development and testing
  const databaseConfig = {
    synchronize: false,
    entities,
    ...connectionConfig,
  }
  return createConnection(databaseConfig)
}

export async function initializeTestDatabase(entities: EntitySchema[]): Promise<Database> {
  const db = await initializeTestDatabaseConnection(entities)
  await db.query(`DROP SCHEMA IF EXISTS "public" CASCADE`)
  await db.query(`CREATE SCHEMA "public"`)
  await db.synchronize()

  return db
}

/*** resetDatabase should never be used in production!!! ***/
export async function resetDatabase(db: Connection) {
  await clearDatabase(db, allEntities)
}

export async function shutdownIntegrationTest(db: Database) {
  if (db) await db.close()
}

export const insertPendingTransaction = insertHashedRecord(PendingTransactions)
export const getPendingTransactions = getManyBy(PendingTransactions)
