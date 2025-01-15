import { Pool } from 'pg'

export class PostgresBridge implements DBBridge {
  private pool: Pool

  constructor(config: { connectionString: string }) {
    this.pool = new Pool(config)
  }

  async getTables(): Promise<string[]> {
    const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
    try {
      const result = await this.pool.query(query)
      return result.rows.map((row) => row.table_name)
    } catch (err) {
      throw new Error(`Failed to fetch tables: ${err.message}`)
    }
  }

  async getColumns(tableName: string): Promise<string[]> {
    const query = `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public';`
    try {
      const result = await this.pool.query(query, [tableName])
      return result.rows.map((row) => row.column_name).filter((col) => col !== 'id')
    } catch (err) {
      throw new Error(`Failed to fetch columns for table ${tableName}: ${err.message}`)
    }
  }

  async query(query: string, values: string[]): Promise<unknown[]> {
    try {
      const result = await this.pool.query(query, values)
      return result.rows
    } catch (err) {
      throw new Error(`Query failed: ${err.message}`)
    }
  }

  async closeConnection(): Promise<void> {
    await this.pool.end()
  }
}
