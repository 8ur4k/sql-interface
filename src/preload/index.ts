import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('db', {
      connectToDatabase: (params: object) => ipcRenderer.invoke('db:connectToDatabase', params),
      quitDatabase: () => ipcRenderer.invoke('db:quitDatabase'),
      getTables: () => ipcRenderer.invoke('db:getTables'),
      getColumns: (tableName: string) => ipcRenderer.invoke('db:getColumns', tableName),
      query: (query: string, values: string[], isExactMatch: boolean) =>
        ipcRenderer.invoke('db:query', query, values, isExactMatch)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
