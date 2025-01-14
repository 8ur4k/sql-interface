import { MongoClient, Db } from 'mongodb'

export class MongoBridge implements DBBridge {
  private client: MongoClient
  private db: Db

  constructor(uri: string, dbName: string) {
    this.client = new MongoClient(uri)
    this.db = this.client.db(dbName)
  }

  private async getConnection(): Promise<Db> {
    // if (!this.client.topology || !this.client.topology.isConnected()) {
    //   await this.client.connect()
    // }
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
      // Extract the collection name from the SQL query
      const matchCollection = sqlQuery.match(/FROM (\w+)/)
      if (!matchCollection) throw new Error('Could not extract collection name from SQL query.')
      const collectionName = matchCollection[1]

      // Prepare the filter object with regex for each parameter in params
      const filter: Record<string, any> = {}

      // Assuming the field we are filtering on is `username` in all cases
      if (params.length > 0) {
        // Handle the case where '%' symbols are included in the parameters
        filter.username = {
          $options: 'i',
          $regex: params
            .map((param) => {
              // Check for '%' and modify the regex pattern accordingly
              if (param.startsWith('%') && param.endsWith('%')) {
                return param.slice(1, -1) // Match any string containing the param
              } else if (param.startsWith('%')) {
                return param.slice(1) // Match any string ending with the param
              } else if (param.endsWith('%')) {
                return param.slice(0, -1) // Match any string starting with the param
              }
              return new RegExp(param, 'i') // Exact match
            })
            .join('|') // Join all patterns with OR logic (this is for multiple params)
        }
      }

      // Perform the MongoDB query with the filter
      const db = await this.getConnection()
      const results = await db.collection(collectionName).find(filter).toArray()
      console.log({ results, collectionName, filter })
      return results
    } catch (err) {
      throw new Error(`Query failed: ${err.message}`)
    }
  }

  async closeConnection(): Promise<void> {
    await this.client.close()
  }
}
