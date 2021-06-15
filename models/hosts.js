const content = require('../data/hosts')
const { writeToFile } = require('../utils')

function findAllHosts() {
    return new Promise((resolve, reject) => {
        resolve(content)
    })
}

function findHostById(identifer) {
    return new Promise((resolve, reject) => {
        const item = content.find((record) => record.id === identifer)
        resolve(item)
    })
}

function addHost(record) {
    let dateTime = new Date()
    const newRecord = {
        id: record.identifier,
        jobid: record.jobid,
        hostcontrol: 1,
        lastUpdateTime: dateTime
    }
    content.push(newRecord)

    writeToFile('./data/hosts.json', content)
    return newRecord
}

function updateHost(newData, identifer) {
    return new Promise((resolve, reject) => {
        newData.lastUpdateTime = new Date()

        const index = content.findIndex((record) => record.id === identifer)
        content[index] = {id: identifer, ...newData}

        writeToFile('./data/hosts.json', content)
        resolve(content[index])
    })
}

function delHost(identifer) {
    return new Promise((resolve, reject) => {
        try {
            // find array index for id and modify content array
            const recordIndex = content.findIndex((record) => record.id === identifer)
            content.splice(recordIndex, 1)

            // writeback to source or db insert into
            writeToFile('./data/hosts.json', content)
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}



module.exports = {
    findAllHosts,
    findHostById,
    addHost,
    updateHost,
    delHost
}