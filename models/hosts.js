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
        let filteredData = content.filter((record) => record.id !== identifer)
        // rewrite to file all data except record matching identifier
        writeToFile('./data/hosts.json', filteredData)
        resolve()
    })
}



module.exports = {
    findAllHosts,
    findHostById,
    addHost,
    updateHost,
    delHost
}