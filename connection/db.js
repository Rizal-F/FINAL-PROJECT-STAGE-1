//import postgres pool
const { Pool } = require('pg')

//setup connection postgres and nodeJs
const dbPool = new Pool({
    database: 'personal_web_b30',
    port: 5432,
    user: 'postgres',
    password: 'Mrf728742'
})

module.exports = dbPool