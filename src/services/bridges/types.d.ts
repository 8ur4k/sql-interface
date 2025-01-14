declare interface DBBridge {
  getTables: () => Promise<string[]>
  getColumns: (table: string) => Promise<string[]>
  query(sql: string, values: string[]): Promise<unknown[]>
}
