import mysql from 'mysql2/promise'

export class MySQLBridge implements DBBridge {
  private pool: mysql.Pool

  constructor(config: mysql.PoolOptions) {
    this.pool = mysql.createPool(config)
  }

  async getTables(): Promise<string[]> {
    const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE();`
    try {
      const [rows] = await this.pool.query(query)
      return (rows as any[]).map((row) => row.TABLE_NAME)
    } catch (err) {
      throw new Error(`Failed to fetch tables: ${err.message}`)
    }
  }

  async getColumns(tableName: string): Promise<string[]> {
    const query = `SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?;`
    try {
      const [rows] = await this.pool.query(query, [tableName])
      return (rows as any[]).map((row) => row.COLUMN_NAME).filter((col) => col !== 'id')
    } catch (err) {
      throw new Error(`Failed to fetch columns for table ${tableName}: ${err.message}`)
    }
  }

  async query(query: string, values: string[]): Promise<unknown[]> {
    try {
      const [rows] = await this.pool.query(query, values)
      console.log({ rows })
      return (rows as any[]).filter((row) => row !== 'id')
    } catch (err) {
      throw new Error(`Query failed: ${err.message}`)
    }
  }

  async closeConnection(): Promise<void> {
    await this.pool.end()
  }
}
