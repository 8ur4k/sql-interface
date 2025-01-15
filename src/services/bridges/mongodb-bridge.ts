import { MongoClient, Db } from 'mongodb'

export class MongoBridge implements DBBridge {
  private client: MongoClient
  private db: Db

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri)
    this.db = this.client.db(dbName)
  }

  private async getConnection(): Promise<Db> {
    return this.db
  }

  async getTables(): Promise<string[]> {
    try {
      const db = await this.getConnection()
      const collections = await db.listCollections().toArray()
      return collections.map((collection) => collection.name)
    } catch (err) {
      throw new Error(`Failed to fetch collections: ${err.message}`)
    }
  }

  async getColumns(collectionName: string): Promise<string[]> {
    try {
      const db = await this.getConnection()
      const sampleDoc = await db.collection(collectionName).findOne()
      if (!sampleDoc) return []
      return Object.keys(sampleDoc).filter((key) => key !== '_id')
    } catch (err) {
      throw new Error(`Failed to fetch fields for collection ${collectionName}: ${err.message}`)
    }
  }

  async query(sqlQuery: string, params: string[]): Promise<unknown[]> {
    try {
      const matchCollection = sqlQuery.match(/FROM (\w+)/)
      if (!matchCollection) throw new Error('Could not extract collection name from SQL query.')
      const collectionName = matchCollection[1]
      const filter: Record<string, any> = {}
      if (params.length > 0) {
        filter.username = {
          $options: 'i',
          $regex: params
            .map((param) => {
              if (param.startsWith('%') && param.endsWith('%')) {
                return param.slice(1, -1)
              } else if (param.startsWith('%')) {
                return param.slice(1)
              } else if (param.endsWith('%')) {
                return param.slice(0, -1)
              }
              return new RegExp(param, 'i')
            })
            .join('|')
        }
      }
      const db = await this.getConnection()
      const results = await db.collection(collectionName).find(filter).toArray()
      return results
    } catch (err) {
      throw new Error(`Query failed: ${err.message}`)
    }
  }

  async closeConnection(): Promise<void> {
    await this.client.close()
  }
}
