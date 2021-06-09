const mssql = require('mssql')

async function dbSelect(config, field, value) {
        try {
                const pool = await mssql.connect(config)
                const record = await pool.request().query("SELECT * from dbo.cust WHERE " + field + " = '" + value + "'")
                pool.close()
    
                return record.recordsets
        } catch (error) {
                throw error
        }
    }

module.exports = {
        dbSelect
}