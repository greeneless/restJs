const { rejects } = require('assert')
const fs = require('fs')
const ini = require('ini')

function validateDataSource(filename) {
    if (fs.existsSync(filename)) {
        console.log('Successfully located source data ' + filename)
        if (fs.statSync(filename).size === 0) {
            console.log('Destination source file is zero bytes, writing empty array... ')
            writeToFile(filename, [])
        }
    } else {
        console.log('Required source file was missing. Created empty array at ' + filename)
        writeToFile(filename, [])
    }
}

function getFuncName() {
    return getFuncName.caller.name
}

function writeToFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content, null, 2), 'utf-8', (error) => console.log(error))
}

function loadFromFile(filename) {
    const output = fs.readFileSync(filename, 'utf-8', function(error, data) {
            if (error) throw error
    })
    return output
}

function arrayFromRootJsonProperty(data, property) {
    try {
        const output = []
        for (let i = 0; i < data.length; i++) {
            output.push(data[i][property])
        }
        return output
    } catch (error) {
        throw error
    }
}

function getPostData(request) {
    return new Promise((resolve, reject) => {
        try {
            let body = ''
            request.on('data', (chunk) => {
                body += chunk.toString()
            })

            request.on('end', () => {
                resolve(body)
            })
        } catch (error) {
            reject(error)
        }
    })
}

function dbAuth() {
    try {
        const config = ini.parse(fs.readFileSync('\\\\mhwissmp01\\Packages\\Install_Tools\\MSPB_SetupCfg.INI', 'utf-8'))
        const mssqlconfig = {
                server: config.SQL.Server,
                user: config.SQL.SqlUid,
                password: config.SQL.SqlPwd + "#",
                database: config.SQL.Database,
                encrypt: false
        }
        return mssqlconfig
    } catch (error) {
        throw error
    }
}

function toBase64(string) {
    return Buffer.from(string, 'utf-8').toString('base64')
}

function fromBase64(base64string) {
    return Buffer.from(base64string, 'base64').toString('utf-8')
}

module.exports = {
    getFuncName,
    writeToFile,
    getPostData,
    loadFromFile,
    arrayFromRootJsonProperty,
    validateDataSource,
    dbAuth,
    toBase64
}