const Data = require('../models/jobs')
const { dbSelect } = require('../dbo')
const { getPostData, getFuncName, toBase64, dbAuth } = require('../utils')
const { addHost, checkHostAvail, modifyHost } = require('../controllers/hosts') 

function rejectRequest(response, message, statuscode) {
        response.writeHead(statuscode, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({'message': message}, null, 2))
}

// @desc    Retrieve bulk
// @route   GET /api/jobs/
async function getData(request, response) {
    try {
        const records = await Data.findAll()
        const output = { jobs: records, count: records.length }
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
// @route   GET /api/jobs/:id
async function getItem(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findById(identifier)
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

// @desc    Update
// @route   POST /api/jobs/
async function addItem(request, response) {
    try {
        const body = await getPostData(request)

        // guard no body content return
        if (!body) {
            response.writeHead(500, {'Content-Type': 'application/json'})
            return response.end(JSON.stringify({'message': 'received ' + request.method + ' ' + request.url + ' with no body content.'}, null, 2))
        }

        let { custid, jobtype, jobstatus, jobhost, jobtask, jobcontrol, jobmsg } = JSON.parse(body)

        // guard request is missing required fields
        if (!custid || !jobtype) {
            response.writeHead(500, {'Content-Type': 'application/json'})
            return response.end(JSON.stringify(
                {
                    'message': 'server error required fields missing',
                    'debugging': 'did you submit an array of post records? one at a time please',
                    'reuired': ['custid', 'jobtype']
                }, null, 2))
        }

        // if not val set val
        if (!jobstatus) { jobstatus = 'new' }
        if (!jobcontrol) {jobcontrol = ''}
        if (!jobhost) { jobhost = '' }
        if (!jobtask) { jobtask = '' }
        if (!jobmsg) {jobmsg = ''}

        // post to API
        const record = {
            custid,
            jobtype,
            jobstatus: jobstatus,
            jobhost: jobhost,
            jobtask: jobtask,
            jobcontrol: jobcontrol,
            jobmsg: jobmsg
        }
        // make sure we're not posting the same identifier
        const identifier = toBase64(jobtype + custid)
        const checkExist = await Data.findById(identifier)
        .then(async r => { 
            if (!r) {
                const newRecord = await Data.add(record)
                response.writeHead(201, {'Content-Type': 'application/json'})
                return response.end(JSON.stringify(newRecord, null, 2))
            } else {
                response.writeHead(304, {'Content-Type': 'application/json'})
                return response.end(JSON.stringify({'message': 'record already exists with identifier ' + identifier}, null, 2))
            }
        })
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

// @desc    Update
// @route   PUT /api/jobs/:id
async function updateItem(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}, null, 2))
        } else {
            // get body data and assign related vars
            const body = await getPostData(request)

            // guard no body content return
            if (!body) {
                response.writeHead(500, {'Content-Type': 'application/json'})
                return response.end(JSON.stringify({'message': 'received ' + request.method + ' ' + request.url + ' with no body content.'}, null, 2))
            }
    
            let { jobtype, jobstatus, jobhost, jobtask, jobcontrol, jobmsg } = JSON.parse(body)

            const recordData = {
                custid: record.custid,
                jobtype: jobtype || record.jobtype,
                jobstatus: jobstatus || record.jobstatus,
                jobhost: jobhost || record.jobhost,
                jobtask: jobtask || record.jobtask,
                jobcontrol: jobcontrol || record.jobcontrol,
                jobmsg: jobmsg || record.jobmsg,
                initialTime: record.initialTime
            }
            const updatedRecord = await Data.update(recordData, record.id)
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
// @route   DELETE /api/jobs/:id
async function deleteItem(request, response, identifier, force=false) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        const record = await Data.findById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}, null, 2))
        } else {
            // forbidden request if job is assigned to a host
            if (record.jobhost && !force) {
                response.writeHead(403, { 'Content-Type': 'application/json' })
                return response.end(JSON.stringify({'message': `forbidden, job already assigned to ${record.jobhost}. id: ${identifier}`}, null, 2))
            }

            // delete the job from the jobs record set
            await Data.del(identifier)
            return response.end(JSON.stringify({'message': `record removed. id: ${identifier}`}, null, 2))
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

// @desc    Update record for accepted job or return no work offered
// @route   GET /api/request/:hostname
async function assignWork(request, response, record, hostname, newcustid='') {
    try {
        response.writeHead(200, {'Content-Type': 'application/json'})
        if (!record) {
            await addHost(hostname, '')
            return response.end(JSON.stringify({'message': 'no work offered'}, null, 2))
        } else {
            // guard host is busy
            const hostCheck = await checkHostAvail(hostname)
            if (!hostCheck) {
                return response.end(JSON.stringify({'message': 'requested host is busy or offline'}, null, 2))
            }

            // main logic
            await addHost(hostname, record.id)
            const recordData = {
                custid: newcustid || record.custid,
                jobtype: record.jobtype,
                jobstatus: 'queued',
                jobhost: hostname,
                jobtask: record.jobtask,
                jobcontrol: record.jobcontrol,
                jobmsg: record.jobmsg,
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
                return response.end(JSON.stringify(responseRecord, null, 2))
            })
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

// @desc    Update record to signal sde [ wait, next, retry, quit ]
// @route   GET /api/jobs/control/:id
async function jobControl(request, response, identifier) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findById(identifier)
        if (!record) {
            response.end(JSON.stringify({'message': 'record not found'}, null, 2))
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
                jobmsg: record.jobmsg,
                initialTime: record.initialTime,
                lastUpdateTime: record.lastUpdateTime
            }
            const updatedRecord = await Data.update(recordData, record.id)
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

// @desc    Update record for finished job if fail. Delete is pass. Update hosts content.
// @route   POST /api/jobs/final/:id
async function jobFinal(request, response, identifier, action) {
    try {
        const record = await Data.findById(identifier)
        if (!record) {
            response.writeHead(404, { 'Content-Type': 'application/json' })
            return response.end(JSON.stringify({'message': 'record not found'}, null, 2))
        }

        // remove assigned job from hosts record set
        const hostCheck = await checkHostAvail(record.jobhost)
        if (!hostCheck) { modifyHost(record.jobhost.toString(), 'jobid', '') }

        response.writeHead(200, { 'Content-Type': 'application/json' })
        if (action === 'pass') {  
            // deletion handles request response
            deleteItem(request, response, identifier, force=true)
        } else if (action === 'fail') {
            const recordData = {
                custid: record.custid,
                jobtype: record.jobtype,
                jobstatus: 'aborted',
                jobhost: '',
                jobtask: record.jobtask,
                jobcontrol: 'wait',
                jobmsg: record.jobmsg,
                initialTime: record.initialTime,
                lastUpdateTime: record.lastUpdateTime
            }
            // this is essentially an internal put request
            const updatedRecord = await Data.update(recordData, record.id)
            return response.end(JSON.stringify(updatedRecord, null, 2))
        } else {
            // invalid action should have already been handled by server.js
            response.writeHead(500, {'Content-Type': 'application/json'})
            return response.end(JSON.stringify(
                {
                    'message': 'request not processed trycatch caught an error in ' + getFuncName(), 
                    'error': 'jobs/final must be followed by pass or fail'
                }, null, 2))
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
