import { Hash } from '../common'

export interface CommonBlock {
  hash: Hash
  format: number
  index: number
  items: Hash
  previous?: Hash
  timestamp: Date
}
