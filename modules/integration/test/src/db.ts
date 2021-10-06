/*** clearDatabase should never be used in production!!! ***/
import { Database } from 'archmage-persistence'
import { Connection, ConnectionOptions, createConnection } from 'typeorm'
import { EntitySchema, ConnectionOptions, createConnection } from 'typeorm'
import * as path from 'path'

export function loadDotEnv() {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
}

export async function clearDatabase(db: Connection, entities: EntitySchema<any>) {
  return Promise.all(allEntities.map(async entity => {
    const meta = db.getMetadata(entity)
    return meta.tableType == 'regular'
      ? db.getRepository(entity).query(`TRUNCATE "${meta.tableName}" CASCADE`)
      : undefined
  }))
}

export async function initializeTestDatabase(): Promise<Database> {
  loadDotEnv()
  const connectionConfig = loadDatabaseConnectionConfig()

  // Inject database structural modification into the configuration
  // This is intended only for development and testing
  const databaseConfig = {
    synchronize: false,
    entities: allEntities,
    ...connectionConfig,
  }
  const db = await createConnection(databaseConfig)
  await db.query(`DROP SCHEMA IF EXISTS "public" CASCADE`)
  await db.query(`CREATE SCHEMA "public"`)
  await db.synchronize()

  return db
}

/*** resetDatabase should never be used in production!!! ***/
export async function resetDatabase(db: Connection) {
  await clearDatabase(db)
}
