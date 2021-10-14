import { Database, getManyBy } from '../persistence'
import { Hash } from '../common'
import { HashLists } from './schema'

export async function getHashListItems(db: Database, list: Hash | undefined): Promise<Hash[]> {
  if (!list) return []

  const records = await getManyBy<HashLists>(HashLists)(db, { list })
  return records
    .map(i => i.item)
    .sort()
}
