import * as crypto from 'crypto'
import { BinaryLike } from 'crypto'
import { Hash } from './types'

export function hashString(value: BinaryLike): Hash {
  return crypto
    .createHash('md5')
    .update(value)
    .digest('hex')
}

export function stringToBuffer(value: string) {
  if (!value) {
    const buffer = Buffer.alloc(2)
    buffer.writeUInt16BE(0, 0)
    return buffer
  } else if (typeof value !== 'string') {
    const buffer = Buffer.alloc(0)
    return buffer
  } else {
    const buffer = Buffer.alloc(2 + value.length)
    buffer.writeUInt16BE(value.length, 0)
    buffer.write(value, 2)
    return buffer
  }
}

export function bufferFromStringArray(values: string[]): Buffer {
  const stringLengths = values.reduce((a, b) => a + b.length, 0)
  const buffer = Buffer.alloc(16 + stringLengths)
  buffer.writeUInt16BE(values.length, 0)
  let offset = 16
  for (const value of values) {
    buffer.write(value, offset, 'hex')
    offset += value.length
  }

  return buffer
}
