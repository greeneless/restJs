const content = require('../data/jobs')
const { writeToFile, toBase64 } = require('../utils')

function findAll() {
    return new Promise((resolve, reject) => {
        resolve(content)
    })
}

function findById(identifer) {
    return new Promise((resolve, reject) => {
        const item = content.find((record) => record.id === identifer)
        resolve(item)
    })
}

function add(newData) {
    return new Promise((resolve, reject) => {
        console.log(newData['custid'], newData['jobtype'])
        let dateTime = new Date()
        const newRecord = {
            id: toBase64(newData['jobtype'] + newData['custid']),
            ...newData,
            initialTime: dateTime,
            lastUpdateTime: dateTime
        }
        content.push(newRecord)

        writeToFile('./data/jobs.json', content)
        resolve(newRecord)
    })
}

function update(newData, identifer) {
    return new Promise((resolve, reject) => {
        newData.lastUpdateTime = new Date()

        const index = content.findIndex((record) => record.id === identifer)
        content[index] = {id: identifer, ...newData}

        writeToFile('./data/jobs.json', content)
        resolve(content[index])
    })
}

function del(identifer) {
    return new Promise((resolve, reject) => {
        let filteredData = content.filter((record) => record.id !== identifer)
        // rewrite to file all data except record matching identifier
        writeToFile('./data/jobs.json', filteredData)
        resolve()
    })
}



module.exports = {
    findAll,
    findById,
    add,
    update,
    del
}