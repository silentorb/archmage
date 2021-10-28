export type Hash = string
export type Uuid = string

export type WithoutHash<T> = Omit<T, 'hash'>
