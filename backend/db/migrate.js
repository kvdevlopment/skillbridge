require('dotenv').config()
const fs = require('fs')
const pool = require('./index')

async function migrate() {
  const sql = fs.readFileSync('./db/schema.sql', 'utf8')
  await pool.query(sql)
  console.log('Migration done!')
  process.exit(0)
}

migrate().catch(err => {
  console.error(err)
  process.exit(1)
})