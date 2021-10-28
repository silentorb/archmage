import { assert } from 'chai'
import { getBlocksBy, integratePendingItems } from 'archmage-chaining'
import { Database, getManyBy, HashLists, } from 'archmage-persistence'
import {
  allEntities,
  getPendingTransactions,
  initializeTestDatabase,
  insertPendingTransaction,
  loadDotEnv,
  PendingTransactions,
  resetDatabase,
  shutdownIntegrationTest,
  Transactions
} from '../src'

describe('chaining-test', function () {
  this.timeout(15000)
  let db: Database

  before(async function () {
    loadDotEnv()
    db = await initializeTestDatabase(allEntities)
  })

  beforeEach(async function () {
    await resetDatabase(db)
  })

  after(function () {
    return shutdownIntegrationTest(db)
  })

  describe('blocks', function () {

    it('can integrate queued content', async function () {
      const transaction1 = await insertPendingTransaction(db, { value: 10 })
      const transaction2 = await insertPendingTransaction(db, { value: 25 })
      await integratePendingItems(db, [[PendingTransactions, Transactions]])

      const remainingPendingTransactions = await getPendingTransactions(db)
      assert.isEmpty(remainingPendingTransactions)

      const blocks = await getBlocksBy(db)
      assert.strictEqual(blocks.length, 1)

      const hashItems = await getManyBy(HashLists)(db)
      assert.strictEqual(hashItems.length, 2)

      const transactions = await getManyBy(Transactions)(db)
      assert.strictEqual(transactions.length, 2)
    })
  })
})
