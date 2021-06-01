const fs = require('fs')

function writeToFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content), 'utf-8', (err) => console.log(err))
}

module.exports = {
    writeToFile
}