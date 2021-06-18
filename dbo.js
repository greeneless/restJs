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


async function dbInsert(config, table, columns, values) {
        if (!Array.isArray(columns)) { return 'columns is not an arry' }
        if (!Array.isArray(values)) { return 'values is not an array' }
        if (columns.length !== values.length) { return 'array lengths do not match' }
        try {
                columns = columns.join(',') 
                values = values.join(',')
                const pool = await mssql.connect(config)
                const record = await pool.request().query(
                        "INSERT INTO " + table + "(" + columns + ") VALUES (" + values + ")")
                pool.close()
    
                return record.recordsets
        } catch (error) {
                throw error
        }
    }

module.exports = {
        dbSelect
}