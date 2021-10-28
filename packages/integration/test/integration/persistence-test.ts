import { assert } from 'chai'
import { Blocks } from 'archmage-chaining'
import {
  Database,
  emptyArrayHash,
  getHashListItems, getListHash,
  getManyBy,
  HashLists,
  hashRecord,
  insertHashList
} from 'archmage-persistence'
import {
  allEntities,
  initializeTestDatabaseConnection,
  loadDotEnv,
  resetDatabase,
  shutdownIntegrationTest
} from '../src'

describe('persistence-test', function () {
  this.timeout(15000)
  let db: Database

  before(async function () {
    loadDotEnv()
    db = await initializeTestDatabaseConnection(allEntities)
  })

  beforeEach(async function () {
    await resetDatabase(db)
  })

  after(function () {
    return shutdownIntegrationTest(db)
  })

  describe('hash lists', function () {
    const hashes = ['f65743962f612b6d60dffa2cda16cef3', 'b617ce5df2ac9c291c385dce652ae404']

    it('can be inserted', async function () {
      const list = await insertHashList(db, hashes)
      const records = await getManyBy(HashLists)(db)
      assert.strictEqual(records.length, 2)
      assert.strictEqual(list, getListHash(hashes))
    })

    it('can be retrieved', async function () {
      const list = await insertHashList(db, hashes)
      const items = await getHashListItems(db, list)
      assert.strictEqual(items.length, 2)
      assert.strictEqual(items[0], 'b617ce5df2ac9c291c385dce652ae404')
      assert.strictEqual(items[1], 'f65743962f612b6d60dffa2cda16cef3')
    })
  })

})
