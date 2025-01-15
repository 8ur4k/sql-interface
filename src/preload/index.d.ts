import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    db: {
      connectToDatabase(params): Promise
      getTables(): Promise
      getColumns(param): Promise
      query(table, variables): Promise
    }
  }
}
