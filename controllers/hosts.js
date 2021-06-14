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
                console.log('POST /api/hosts [INTERNAL - CREATE]')
            } else {
                let updatedRecord = {
                    ...r,
                }
                updatedRecord.jobid = jobid
                updatedRecord = await Data.updateHost(updatedRecord, identifier)
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

// @desc    Inquire
// @route   GET /api/hosts/:id
async function checkHost(identifier) {
    try {
        // make sure we're not posting the same identifier
        const checkExist = await Data.findHostById(identifier)
        .then(async r => { 
            if (!r) {
                return true
            } else {
                if (r.jobid) {
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

module.exports = {
    getHosts,
    getHost,
    addHost,
    updateHost,
    deleteHost,
    checkHost
}
