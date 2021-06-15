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
        try {
            // find array index for id and modify content array
            let index = content.findIndex((record) => record.id === identifer)
            content.splice(index, 1)

            // writeback to source or db insert into
            writeToFile('./data/jobs.json', content)
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}



module.exports = {
    findAll,
    findById,
    add,
    update,
    del
}