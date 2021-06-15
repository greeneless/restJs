const Data = require('../models/hosts')
const { getPostData, getFuncName } = require('../utils')

// @desc    Retrieve bulk
// @route   GET /api/hosts/
async function getHosts(request, response) {
    try {
        const records = await Data.findAllHosts()
        const output = { hosts: records, count: records.length }
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(output, null, 2))
    } catch (error) {
        console.log(error)
        response.writeHead(500, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(
            {
                'message': 'request not processed trycatch caught an error in ' + getFuncName(),
                'error': error
            }, null, 2))
    }
}

// @desc    Inquire
// @route   GET /api/hosts/:id
async function getHost(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findHostById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}, null, 2))
        } else {
            response.end(JSON.stringify(record, null, 2))
        }
    } catch (error) {
        console.log(error)
        response.writeHead(500, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(
            {
                'message': 'request not processed trycatch caught an error in ' + getFuncName(),
                'error': error
            }, null, 2))
    }
}

// @desc    Create or update
// @route   POST or PUT /api/hosts/ [INTERNAL, NO REQ/RES]
async function addHost(identifier, jobid) {
    try {
        // jobid can be empty string if no jobs avail
        const record = { identifier, jobid }

        // make sure we're not posting the same identifier
        const checkExist = await Data.findHostById(identifier)
        .then(async r => { 
            if (!r) {
                const newRecord = await Data.addHost(record)
                console.log('POST /api/hosts [INTERNAL - CREATED]')
            } else {
                let updatedRecord = {
                    ...r,
                }
                updatedRecord.jobid = jobid
                updatedRecord = await Data.updateHost(updatedRecord, identifier)
                console.log('PUT /api/hosts [INTERNAL - TIMESTAMP UPDATED]')
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// @desc    Update
// @route   PUT /api/hosts/:id
async function updateHost(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findHostById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}, null, 2))
        } else {

        const body = await getPostData(request)
        let { jobid, hostcontrol } = JSON.parse(body)
        if (!hostcontrol === 0 || !hostcontrol === 1) {
            console.log('Host control must be int, 0 || 1')
            hostcontrol = record.hostcontrol
        }
        const recordData = { jobid: jobid || record.jobid, hostcontrol: hostcontrol }
        const updatedRecord = await Data.updateHost(recordData, record.id)
        return response.end(JSON.stringify(updatedRecord, null, 2))
    }
    } catch (error) {
        console.log(error)
        response.writeHead(500, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(
            {
                'message': 'request not processed trycatch caught an error in ' + getFuncName(),
                'error': error
            }, null, 2))
    }
}

// @desc    Delete record
// @route   DELETE /api/hosts/:id
async function deleteHost(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findHostById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}, null, 2))
        } else {
            await Data.delHost(identifier)
            response.end(JSON.stringify({'message': `record removed. id: ${identifier}`}, null, 2))
        }
    } catch (error) {
        console.log(error)
        response.writeHead(500, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(
            {
                'message': 'request not processed trycatch caught an error in ' + getFuncName(),
                'error': error
            }, null, 2))
    }
}

// @desc    Inquire
// @route   GET /api/hosts/:id
async function checkHostAvail(identifier) {
    try {
        const checkExist = await Data.findHostById(identifier)
        .then(async r => { 
            if (!r) {
                return true
            } else {
                if (r.jobid || r.hostcontrol === 0) {
                    // host is not available
                    return false
                } else {
                    return true
                }
            }
        })
        return checkExist
    } catch (error) {
        console.log(error)
    }
}


// @desc    Update hosts content without server reply
// @route   PUT /api/hosts/:id [INTERNAL, NO REQ/RES]]
async function modifyHost(identifier, field, value) {
    try {
        const record = await Data.findHostById(identifier)
        if (!record) {
            console.log('GET /api/hosts/' + identifier + ' [INTERNAL - RECORD NOT FOUND]')
        } else {
            let recordData = {...record}
            recordData[field] = value
            const updatedRecord = await Data.updateHost(recordData, record.id)
            console.log('PUT /api/hosts/' + identifier + ' [INTERNAL - UPDATED JOBID]')
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getHosts,
    getHost,
    addHost,
    updateHost,
    modifyHost,
    deleteHost,
    checkHostAvail
}
