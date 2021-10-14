import { Connection } from 'typeorm'

export type Database = Connection
export type BaseRecord<T> = Omit<T, 'created'>
export type BaseHashRecord<T> = Omit<T, 'created' | 'hash' | 'format'>
