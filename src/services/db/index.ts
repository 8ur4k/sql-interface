// import { MySQLBridge } from '../bridges/mysql-bridge'
// const db = new MySQLBridge({
//   host: 'autorack.proxy.rlwy.net',
//   port: 33624,
//   user: 'root',
//   password: 'uFmSghkyFSmUPHaUwemQlTNzsRdpLknI',
//   database: 'railway'
// })

import { SQLiteBridge } from '../bridges/sqlite-bridge'
const path = require('path')
const dbPath = path.join(__dirname, '../../data/test123.db')
const db = new SQLiteBridge(dbPath)

// import { MongoBridge } from '../bridges/mongodb-bridge'
// const config = {
//   uri: 'mongodb+srv://esteban:OowPtAsgyi8aN1E2@meayapp.0nds9rl.mongodb.net/',
//   dbName: 'meay'
// }

// const db = new MongoBridge(config.uri, config.dbName)

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
