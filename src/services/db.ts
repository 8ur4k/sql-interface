const sqlite3 = require('sqlite3').verbose()
const path = require('path')

export function getPeople() {
  console.log('people')
  return 1
}

export function getTables() {
  const dbPath = path.join(__dirname, '../../data/test123.db')
  const db = new sqlite3.Database(dbPath)

  return new Promise((resolve, reject) => {
    db.all(`SELECT name FROM sqlite_master WHERE type='table';`, [], (err, rows) => {
      db.close()
      if (err) reject(err)
      else resolve(rows.map((row) => row.name))
    })
  })
}

export function getColumns(tableName) {
  const dbPath = path.join(__dirname, '../../data/test123.db')
  const db = new sqlite3.Database(dbPath)

  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName});`, [], (err, rows) => {
      db.close()
      if (err) reject(err)
      else resolve(rows.filter((row) => row.name != 'id').map((row) => row.name))
    })
  })
}

export function queryTable(params) {
  const tableName = params.tableName
  const conditions = params.conditions || {}
  const dbPath = path.join(__dirname, '../../data/test123.db')
  const db = new sqlite3.Database(dbPath)

  Object.keys(conditions).forEach((key) => console.log(key))

  const whereClause = Object.keys(conditions)
    .map((key) => `${key} LIKE ?`)
    .join(' AND ')

  const values = Object.values(conditions).map((val) => `%${val}%`)

  const query = `SELECT * FROM ${tableName} ${whereClause ? `WHERE ${whereClause}` : ''}`
  console.log(query)

  return new Promise((resolve, reject) => {
    db.all(query, values, (err, rows) => {
      db.close()
      if (err) reject(err)
      else resolve(rows.filter((row) => row != 'id'))
    })
  })
}
// export function queryTable(params) {
//   const conditions = params.conditions || {}
//   const dbPath = path.join(__dirname, '../../data/test123.db')
//   const db = new sqlite3.Database(dbPath)

//   console.log(conditions)

//   const whereClause = Object.keys(conditions)
//     .map((key) => `${key} LIKE ?`)
//     .join(' AND ')
//   const values = Object.values(conditions).map((val) => `%${val}%`)

//   const query = `SELECT * FROM ${params.tableName} ${whereClause ? `WHERE ${whereClause}` : ''}`
//   console.log(query)

//   return new Promise((resolve, reject) => {
//     db.all(query, values, (err, rows) => {
//       console.log(err)
//       db.close()
//       if (err) reject(err)
//       else resolve(rows)
//     })
//   })
// }
