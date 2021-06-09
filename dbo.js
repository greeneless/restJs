const mssql = require('mssql')

async function dbSelect(config, table, field, value) {
        try {
                const pool = await mssql.connect(config)
                const record = await pool.request().query("SELECT * from " + table + " WHERE " + field + " = '" + value + "'")
                pool.close()
    
                return record.recordsets
        } catch (error) {
                throw error
        }
    }

module.exports = {
        dbSelect
}