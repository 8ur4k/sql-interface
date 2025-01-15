import { MySQLBridge } from '../bridges/mysql-bridge'
import { SQLiteBridge } from '../bridges/sqlite-bridge'
import { MongoBridge } from '../bridges/mongodb-bridge'
let db: any = null

function connectToDatabase(params) {
  switch (params.name) {
    case 'Sqlite':
      db = new SQLiteBridge(params.methodInputs.find((input) => input.name === 'dbPath').value)
      break
    case 'MySQL':
      db = new MySQLBridge({
        host: params.methodInputs.find((input) => input.name === 'host').value,
        port: params.methodInputs.find((input) => input.name === 'port').value,
        user: params.methodInputs.find((input) => input.name === 'user').value,
        password: params.methodInputs.find((input) => input.name === 'password').value,
        database: params.methodInputs.find((input) => input.name === 'database').value
      })
      break
    case 'MongoDB':
      db = new MongoBridge(
        params.methodInputs.find((input) => input.name === 'uri').value,
        params.methodInputs.find((input) => input.name === 'dbName').value
      )
      break
    default:
      break
  }
}

function quitDatabase() {
  db = null
}

function getTables() {
  return db.getTables()
}

function getColumns(tableName) {
  return db.getColumns(tableName)
}

function query(tableName, conditions, isExactMatch) {
  const whereClause = Object.keys(conditions)
    .map((key) => (isExactMatch ? `${key} = ?` : `${key} LIKE ?`))
    .join(' AND ')

  const query = `SELECT * FROM ${tableName} ${whereClause ? `WHERE ${whereClause}` : ''}`
  const values = Object.values(conditions).map((val) => (isExactMatch ? `${val}` : `%${val}%`))

  return db.query(query, values)
}

export const DatabaseService = {
  connectToDatabase,
  quitDatabase,
  getTables,
  getColumns,
  query
}
