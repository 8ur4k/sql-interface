declare interface DBBridge {
  connectToDatabase: () => undefined
  getTables: () => Promise<string[]>
  getColumns: (table: string) => Promise<string[]>
  query(sql: string, values: string[]): Promise<unknown[]>
}
