const Data = require('../models/jobs')
const { dbSelect } = require('../dbo')
const { getPostData, getFuncName, toBase64, dbAuth } = require('../utils')
// change to function getData
// @desc    Retrieve bulk
// @route   GET /api/jobs/
async function getData(request, response) {
    try {
        const records = await Data.findAll()

        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(records))
        // return response.end(JSON.stringify(records, null, 2))
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

// change to function getItem
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
            // return response.end(JSON.stringify(record, null, 2))
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

// change to function addItem 
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
        //const identifier = toBase64(jobtype + custid)
        const checkExist = await Data.findById(toBase64(jobtype + custid))
        .then(async r => { 
            if (!r) {
                const newRecord = await Data.add(record)
                response.writeHead(201, {'Content-Type': 'application/json'})
                return response.end(JSON.stringify(newRecord))
            } else {
                response.writeHead(200, {'Content-Type': 'application/json'})
                return response.end(JSON.stringify({'message': 'record already exists'}))
            }
        })
        // const newRecord = await Data.add(record)
        // response.writeHead(201, {'Content-Type': 'application/json'})
        // return response.end(JSON.stringify(newRecord))
        // return response.end(JSON.stringify(newRecord, null, 2))
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

// change to function updateItem 
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
        // return response.end(JSON.stringify(updatedRecord, null, 2))
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

// change to function delItem
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

module.exports = {
    getData,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    assignWork
}
