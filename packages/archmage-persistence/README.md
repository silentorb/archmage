# Archmage Persistence

Created by Christopher W. Johnson

## Overview

* Archmage Recording is a library for adding immutable record hashing to a Node.js app using TypeORM and PostgreSQL
* It provides the following features
  * Storing blockchains inside SQL tables
  * Hashing TypeORM entities
  * Generating [Merkle Trees](https://en.wikipedia.org/wiki/Merkle_tree)

## Examples

```typescript
import { Column, Entity } from 'typeorm'
import { HashedTable } from 'archmage-persistence'

@Entity()
export class MyTable extends HashedTable {
  @Column('integer')
  value!: number
}
```

```typescript
import { createConnection } from 'typeorm'
import { hashRecord, insertHashedRecord, insertHashList } from 'archmage-persistence'

const insertMyRecord = await insertHashedRecord(MyTable)

const db = await createConnection(databaseConfig)
const data = {
  value: 10,
}

// Generate the hash for the record and insert the record.
const record = await insertMyRecord(db, data)
console.log('record hash', record.hash)

// Generate the hash without inserting the record
const hash = hashRecord(MyRecord)(data)

// Hash a list of hashes and insert records for that list, returning the new hash
const list = insertHashList(db, [hash, '0d5ba24ef200f9db4685175bd5f7edcb'])

// In the above line two records are inserted into the HashLists table:
// one record for each item in the list

// Retrieve the items within a hash list
const items = await getHashListItems(db, list)
```

## Documentation

The API documentation can be found [here](./docs/README.md).
