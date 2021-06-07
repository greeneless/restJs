const { rejects } = require('assert')
const fs = require('fs')

function validateDataSource(filename) {
    if (!fs.existsSync(filename)) {
        console.log('Required source file was missing. Created empty array at ' + filename)
        writeToFile(filename, [])
    } else {
        console.log('Successfully located source data ' + filename)
    }
}

function getFuncName() {
    return getFuncName.caller.name
}

function writeToFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content, null, 2), 'utf-8', (error) => console.log(error))
}

function loadFromFile(filename) {
    // Read a json source file
    var output = fs.readFileSync(filename, 'utf-8', function(error, data) {
            if (error) throw error;
    })
    return output;
}

function arrayFromRootJsonProperty(data, property) {
    try {
        const output = []
        for (let i = 0; i < data.length; i++) {
            output.push(data[i][property])
        }
        return output;
    } catch (error) {
        throw error;
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

module.exports = {
    getFuncName,
    writeToFile,
    getPostData,
    loadFromFile,
    arrayFromRootJsonProperty,
    validateDataSource
}