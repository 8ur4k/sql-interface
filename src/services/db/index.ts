
import { SQLiteBridge } from '../bridges/sqlite-bridge'
const path = require('path')
const dbPath = path.join(__dirname, '../../data/test123.db')
const db = new SQLiteBridge(dbPath)


function getTables() {
  return db.getTables()
}

function getColumns(tableName) {
  return db.getColumns(tableName)
}

function query(tableName, conditions) {
  Object.keys(conditions).forEach((key) => console.log(key))

  const whereClause = Object.keys(conditions)
    .map((key) => `${key} LIKE ?`)
    .join(' AND ')

  const query = `SELECT * FROM ${tableName} ${whereClause ? `WHERE ${whereClause}` : ''}`
  const values = Object.values(conditions).map((val) => `%${val}%`)

  return db.query(query, values)
}

export const DatabaseService = {
  getTables,
  getColumns,
  query
}
