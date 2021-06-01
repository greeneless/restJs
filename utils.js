const { rejects } = require('assert')
const fs = require('fs')

function writeToFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content), 'utf-8', (err) => console.log(err))
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
    writeToFile,
    getPostData
}