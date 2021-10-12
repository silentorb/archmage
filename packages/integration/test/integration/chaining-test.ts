import { assert } from 'chai'
import { Blocks, chainingTables, Database, emptyArrayHash, hashRecord } from 'archmage-chaining'
import { initializeTestDatabase, loadDotEnv, resetDatabase, shutdownIntegrationTest } from '../src'

describe('chaining-test', function () {
  this.timeout(15000)
  let db: Database

  before(async function () {
    loadDotEnv()
    db = await initializeTestDatabase(chainingTables)
  })

  beforeEach(async function () {
    await resetDatabase(db)
  })

  after(function () {
    return shutdownIntegrationTest(db)
  })

})
