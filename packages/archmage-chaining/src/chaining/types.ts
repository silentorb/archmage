import { Hash } from '../common'

export interface Block {
  hash: Hash
  format: number
  number: number
  content: Hash
  previous?: Hash
  timestamp: Date
}
