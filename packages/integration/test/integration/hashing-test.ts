import { assert } from 'chai'
import { Blocks, Database, emptyArrayHash, hashRecord } from 'archmage-chaining'
import { allEntities, initializeTestDatabaseConnection, loadDotEnv, shutdownIntegrationTest } from '../src'

describe('chaining-test', function () {
  this.timeout(15000)
  let db: Database

  before(async function () {
    loadDotEnv()
    db = await initializeTestDatabaseConnection(allEntities)
  })

  after(function () {
    return shutdownIntegrationTest(db)
  })

  describe('block hashing', function () {
    it('works', async function () {
      const block1: Partial<Blocks> = {
        number: 0,
        content: emptyArrayHash,
        previous: undefined,
        timestamp: new Date(1634051175285)
      }
      const block2 = { ...block1, number: 1 }
      const hash1 = hashRecord(Blocks)(db)(block1)
      const hash2 = hashRecord(Blocks)(db)(block2)
      assert.strictEqual(hash1, '6080251edbba3d5679cd3ba0c5f891b3')
      assert.strictEqual(hash2, '5ab3432861123762120c9e7b43c00263')
    })
  })

})
