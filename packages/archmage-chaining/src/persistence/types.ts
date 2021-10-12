import { Connection, ObjectType } from 'typeorm'

export type Database = Connection
export type Table<T> = ObjectType<T> // | EntitySchema<T>
export type BaseRecord<T> = Omit<T, 'created' | 'modified' | 'deleted'>
export type BaseHashRecord<T> = Omit<T, 'created' | 'modified' | 'deleted' | 'hash'>
