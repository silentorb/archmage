import { EntitySchema, ObjectType } from 'typeorm'
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata'
import { bufferFromStringArray, hashString, stringToBuffer } from 'archmage-common'
import { ColumnType } from 'typeorm/driver/types/ColumnTypes'
import { BaseHashRecord, Database } from 'archmage-persistence'

export const doNotHash = 'doNotHash'

function getColumnType(column: ColumnMetadata): string {
  return typeof column.type === 'string' ? column.type : column.type.name.toLowerCase()
}

export function bufferFromColumnValue(column: ColumnMetadata, value: any): Buffer {
  const type: ColumnType = getColumnType(column) as any
  switch (type) {
    case 'boolean': {
      const buffer = Buffer.alloc(1)
      buffer.writeUInt8(value ? 1 : 0, 0)
      return buffer
    }
    case 'date': {
      const buffer = Buffer.alloc(8)
      const date = value instanceof Date ? value : new Date(value)
      const dateNumber = date.getTime()
      buffer.writeInt16BE(0, 0)
      buffer.writeIntBE(dateNumber, 2, 6)
      return buffer
    }
    case 'double precision': {
      const buffer = Buffer.alloc(8)
      buffer.writeDoubleBE(value, 0)
      return buffer
    }
    case 'integer': {
      const buffer = Buffer.alloc(4)
      if (column.unsigned) {
        buffer.writeUInt32BE(value, 0)
      } else {
        buffer.writeInt32BE(value, 0)
      }
      return buffer
    }
    case 'money': {
      const buffer = Buffer.alloc(8)
      buffer.writeDoubleBE(value, 0)
      return buffer
    }
    case 'smallint': {
      const buffer = Buffer.alloc(2)
      if (column.unsigned) {
        buffer.writeUInt16BE(value, 0)
      } else {
        buffer.writeInt16BE(value, 0)
      }
      return buffer
    }
    case 'numeric': {
      return stringToBuffer(value ? value.toString() : undefined)
    }
    case 'string':
    case 'text': {
      return stringToBuffer(value)
    }
    case 'uuid': {
      const hexString = value?.replace(/-/g, '') || '00000000000000000000000000000000'
      if (hexString.length != 32) throw new Error(`Invalid UUID length: ${hexString.length}`)
      return Buffer.from(hexString, 'hex')
    }

    default:
      throw new Error(`Column type ${type} is not yet supported for automated record hashing in column ${column.propertyName}`)
  }
}

export function newHashingMetadata<T>(db: Database, table: ObjectType<T> | EntitySchema<T>): ColumnMetadata[] {
  const metadata = db.getMetadata(table)
  return metadata.columns
    .sort((a, b) => a.propertyName.localeCompare(b.propertyName))
}

export const hashRecordFromColumns = <T>(columns: ColumnMetadata[]) => (record: BaseHashRecord<T>) => {
  const filteredColumns = columns.filter(c => c.comment != doNotHash)
  const buffers = filteredColumns
    .map(column => bufferFromColumnValue(column, (record as any)[column.propertyName]))
  const buffer = Buffer.concat(buffers)
  return hashString(buffer)
}

export const hashRecord = <T>(table: ObjectType<T> | EntitySchema<T>) => (db: Database) => {
  // Somehow this columns array is not including any inherited meta fields, which is
  // usually the desired result for this project but still unexpected and sometimes the meta columns may be needed
  return hashRecordFromColumns(newHashingMetadata(db, table))
}

export const emptyArrayHash = hashString(bufferFromStringArray([]))
