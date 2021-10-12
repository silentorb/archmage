import { assert } from 'chai'
import { Database } from 'archmage-persistence'

describe('sample-test', function() {
  this.timeout(15000)
  let server: any
  let db: Database

  before(async function() {
    db = await initializeTestDatabase()
    server = await startTestApi()
  })

  beforeEach(async function() {
    await resetDatabase(db)
  })

  after(function() {
    return shutdownIntegrationTest(server, db)
  })

  // Test cases here...
})

// Another file:


export async function shutdownIntegrationTest(server: any, db: Database) {
  if (server) await new Promise(r => server.close(r))
  if (db) await db.close()
}
