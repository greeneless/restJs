const Data = require('../models/jobs')
const { dbSelect } = require('../dbo')
const { getPostData, getFuncName, toBase64, dbAuth } = require('../utils')

function rejectRequest(response, message, statuscode) {
        response.writeHead(statuscode, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({'message': message}))
}

// @desc    Retrieve bulk
// @route   GET /api/jobs/
async function getData(request, response) {
    try {
        const records = await Data.findAll()
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
// @route   GET /api/jobs/:id
async function getItem(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findById(identifier)
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
// @route   POST /api/jobs/
async function addItem(request, response) {
    try {
        const body = await getPostData(request)
        // guard no body content return
        if (!body) {
            response.writeHead(500, {'Content-Type': 'application/json'})
            return response.end(JSON.stringify({'message': 'received POST ' + request.url + ' with no body content.'}))
        }

        let { custid, jobtype, jobstatus, jobhost, jobtask, jobcontrol } = JSON.parse(body)

        // guard request is missing required fields
        if (!custid || !jobtype) {
            response.writeHead(500, {'Content-Type': 'application/json'})
            return response.end(JSON.stringify(
                {
                    'message': 'server error required fields missing',
                    'debugging': 'did you submit an array of post records? one at a time please',
                    'reuired': ['custid', 'jobtype']
                }))
        }

        // if not val set val
        if (!jobstatus) { jobstatus = 'new' }
        if (!jobcontrol) {jobcontrol = ''}
        if (!jobhost) { jobhost = '' }
        if (!jobtask) { jobtask = '' }

        // post to API
        const record = {
            custid,
            jobtype,
            jobstatus: jobstatus,
            jobhost: jobhost,
            jobtask: jobtask,
            jobcontrol: jobcontrol
        }
        // make sure we're not posting the same identifier
        const identifier = toBase64(jobtype + custid)
        const checkExist = await Data.findById(identifier)
        .then(async r => { 
            if (!r) {
                const newRecord = await Data.add(record)
                response.writeHead(201, {'Content-Type': 'application/json'})
                return response.end(JSON.stringify(newRecord))
            } else {
                response.writeHead(200, {'Content-Type': 'application/json'})
                return response.end(JSON.stringify({'message': 'record already exists with identifier ' + identifier}))
            }
        })
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
// @route   PUT /api/jobs/:id
async function updateItem(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {

        const body = await getPostData(request)
        let { jobtype, jobstatus, jobhost, jobtask, initialTime, lastUpdateTime } = JSON.parse(body)
        const recordData = {
            custid: record.custid,
            jobtype: jobtype || record.jobtype,
            jobstatus: jobstatus || record.jobstatus,
            jobhost: jobhost || record.jobhost,
            jobtask: jobtask || record.jobtask,
            initialTime: initialTime || record.initialTime,
            lastUpdateTime: lastUpdateTime || record.lastUpdateTime
        }
        const updatedRecord = await Data.update(recordData, record.id)
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
async function deleteItem(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {
            await Data.del(identifier)
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

// @desc    Update record for accepted job or return no work offered
// @route   GET /api/request/:hostname
async function assignWork(request, response, record, hostname, newcustid='') {
    try {
        response.writeHead(200, {'Content-Type': 'application/json'})
        if (!record) {
            response.end(JSON.stringify({'message': 'no work offered'}))
        } else {
            const recordData = {
                custid: newcustid || record.custid,
                jobtype: record.jobtype,
                jobstatus: 'queued',
                jobhost: hostname,
                jobtask: record.jobtask,
                jobcontrol: record.jobcontrol,
                initialTime: record.initialTime,
                lastUpdateTime: record.lastUpdateTime
            }
            const sqlconfig = dbAuth()
            dbSelect(sqlconfig, 'dbo.cust', 'cid', newcustid || record.custid).then(async r => {
                const updatedRecord = await Data.update(recordData, record.id)
                const responseRecord = {
                    ...updatedRecord,
                    su: r[0][0]['su'].trim(),
                    sp: r[0][0]['sp'].trim(),
                    sm: r[0][0]['sm'].trim().replace('\\r', '').replace('\\n', '')
                }
                return response.end(JSON.stringify(responseRecord))
            })
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

// @desc    Update record to signal sde [ wait, next, retry, quit ]
// @route   GET /api/jobs/control/:id
async function jobControl(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {
            let control = ''
            if (record.jobstatus.toLowerCase() === 'fail') {control = 'wait'}
            const recordData = {
                custid: record.custid,
                jobtype: record.jobtype,
                jobstatus: record.jobstatus,
                jobhost: record.jobhost,
                jobtask: record.jobtask,
                jobcontrol: control || record.jobcontrol,
                initialTime: record.initialTime,
                lastUpdateTime: record.lastUpdateTime
            }
            const updatedRecord = await Data.update(recordData, record.id)
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

async function jobFinal(request, response, identifier, action) {
    if (action === 'pass') {
        // we will process this as a deletion
        return deleteItem(request, response, identifier)
    }
    if (action === 'fail') {
        try {
            response.writeHead(200, { 'Content-Type': 'application/json' })
    
            const record = await Data.findById(identifier)
            if (!record) {
                response.end(JSON.stringify({'message': 'record not found'}))
            } else {
                const control = 'wait'
                const status = 'aborted'
                const recordData = {
                    custid: record.custid,
                    jobtype: record.jobtype,
                    jobstatus: status,
                    jobhost: record.jobhost,
                    jobtask: record.jobtask,
                    jobcontrol: control,
                    initialTime: record.initialTime,
                    lastUpdateTime: record.lastUpdateTime
                }
                const updatedRecord = await Data.update(recordData, record.id)
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
}
module.exports = {
    getData,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    rejectRequest,
    assignWork,
    jobControl,
    jobFinal
}
