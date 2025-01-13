import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getPeople(): number
      getTables(): Promise
      getColumns(param): Promise
      queryTable(param): Promise
    }
  }
}
