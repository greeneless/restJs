const Data = require('../models/hosts')
const { getPostData, getFuncName } = require('../utils')

// @desc    Retrieve bulk
// @route   GET /api/hosts/
async function getHosts(request, response) {
    try {
        const records = await Data.findAllHosts()
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(records))
    } catch (error) {
        console.log(error)
        response.writeHead(500, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(
            {
                'message': 'request not processed trycatch caught an error in ' + getFuncName(),
                'error': error
            }))
    }
}

// @desc    Inquire
// @route   GET /api/hosts/:id
async function getHost(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findHostById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {
            response.end(JSON.stringify(record))
        }
    } catch (error) {
        console.log(error)
        response.writeHead(500, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(
            {
                'message': 'request not processed trycatch caught an error in ' + getFuncName(),
                'error': error
            }))
    }
}

// @desc    Update
// @route   POST /api/hosts/ [INTERNAL, NO REQUEST/RESPONSE]
async function addHost(identifier, jobid) {
    try {
        // make sure we're not posting the same identifier
        const record = { identifier, jobid }
        const checkExist = await Data.findHostById(identifier)
        .then(async r => { 
            if (!r) {
                const newRecord = await Data.addHost(record)
                console.log('POST /api/hosts [INTERNAL - CREATE]')
            } else {
                const updatedRecord = await Data.updateHost(r, identifier)
                console.log('PUT /api/hosts [INTERNAL - TIMESTAMP UPDATE]')
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// @desc    Update
// @route   PUT /api/jobs/:id
async function updateHost(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findHostById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {

        const body = await getPostData(request)
        let { jobid } = JSON.parse(body)
        const recordData = {
                jobid: jobid || record.jobid,
                lastUpdateTime: record.lastUpdateTime
        }
        const updatedRecord = await Data.updateHost(recordData, record.id)
        return response.end(JSON.stringify(updatedRecord))
    }
    } catch (error) {
        console.log(error)
        response.writeHead(500, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(
            {
                'message': 'request not processed trycatch caught an error in ' + getFuncName(),
                'error': error
            }))
    }
}

// @desc    Delete record
// @route   DELETE /api/jobs/:id
async function deleteHost(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findHostById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {
            await Data.delHost(identifier)
            response.end(JSON.stringify({'message': `record removed. id: ${identifier}`}))
        }
    } catch (error) {
        console.log(error)
        response.writeHead(500, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(
            {
                'message': 'request not processed trycatch caught an error in ' + getFuncName(),
                'error': error
            }))
    }
}

module.exports = {
    getHosts,
    getHost,
    addHost,
    updateHost,
    deleteHost
}
