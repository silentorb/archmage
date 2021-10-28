import { assert } from 'chai'
import { Blocks } from 'archmage-chaining'
import { Database, emptyArrayHash, getManyBy, HashLists, hashRecord, insertHashList } from 'archmage-persistence'
import {
  allEntities,
  initializeTestDatabaseConnection,
  loadDotEnv,
  resetDatabase,
  shutdownIntegrationTest
} from '../src'

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
      assert.strictEqual(hash1, 'f65743962f612b6d60dffa2cda16cef3')
      assert.strictEqual(hash2, 'b617ce5df2ac9c291c385dce652ae404')
    })
  })

})
