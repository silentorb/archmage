import { Hash } from 'archmage-common'

export interface CommonBlock {
  hash: Hash
  previous?: Hash
  format: number
  timestamp: Date
}
