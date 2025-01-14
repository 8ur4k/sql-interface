const sqlite3 = require('sqlite3').verbose()

export class SQLiteBridge implements DBBridge {
  private dbPath
  private getConnection() {
    return new sqlite3.Database(this.dbPath)
  }

  constructor(dbPath: string) {
    this.dbPath = dbPath
  }

  async getTables() {
    return new Promise<string[]>((resolve, reject) => {
      const sqliteDb = this.getConnection()

      sqliteDb.all(`SELECT name FROM sqlite_master WHERE type='table';`, [], (err, rows) => {
        sqliteDb.close()
        if (err) reject(err)
        else {
          const tables = rows.map((row) => row.name)
          resolve(tables)
        }
      })
    })
  }

  async getColumns(tableName: string) {
    const sqliteDb = this.getConnection()

    return new Promise<string[]>((resolve, reject) => {
      sqliteDb.all(`PRAGMA table_info(${tableName});`, [], (err, rows) => {
        sqliteDb.close()
        if (err) reject(err)
        else resolve(rows.filter((row) => row.name != 'id').map((row) => row.name))
      })
    })
  }

  async query(query: string, values: string[]): Promise<unknown[]> {
    const sqliteDb = this.getConnection()

    return new Promise<unknown[]>((resolve, reject) => {
      sqliteDb.all(query, values, (err, rows) => {
        sqliteDb.close()
        if (err) reject(err)
        else resolve(rows.filter((row) => row != 'id'))
      })
    })
  }
}
