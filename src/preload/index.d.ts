import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    db: {
      getTables(): Promise
      getColumns(param): Promise
      query(table, variables): Promise
    }
  }
}
