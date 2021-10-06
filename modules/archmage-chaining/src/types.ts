import { Hash } from 'archmage-common'

export interface CommonBlock {
  hash: Hash
  format: number
  index: number
  items: Hash
  previous?: Hash
  timestamp: Date
}
