const Data = require('../models/jobs')
const { getPostData } = require('../utils')

// change to function getData
// @desc    Retrieve bulk
// @route   GET /api/jobs/
async function getData(request, response) {
    try {
        const records = await Data.findAll()

        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(records))
    } catch (error) {
        console.log(error)
    }

}

async function getOldestUnassignedJobUuid() {
    try {
        const records = JSON.stringify(await Data.findAll())
        let status = []
        for (let i = 0; i < records.length; i++) {
            if (records[i].jobstatus.lower() === 'new') {
                status.push(records[i].custid)
            }
        }
        return status
        
    } catch (error) {
        console.log(error)
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
        }
    } catch (error) {
        console.log(error)
    }

}

// change to function addItem 
// @desc    Update
// @route   POST /api/jobs/
async function addItem(request, response) {
    try {
        const body = await getPostData(request)
        let { custid, jobtype, jobstatus, jobhost, jobtask, initialTime } = JSON.parse(body)
        if (!jobstatus) { jobstatus = 'new' }
        if (!jobhost) { jobhost = '' }
        if (!jobtask) { jobtask = '' }
        if (!initialTime) {initialTime = new Date()}
        if (!custid || !jobtype) {
            response.writeHead(500, {'Content-Type': 'application/json'})
            return response.end(JSON.stringify(
                {
                    'message': 'server error required fields missing',
                    'debugging': 'did you submit an array of post records? one at a time please',
                    'reuired': ['custid', 'jobtype']
                }))
        } else {
            // post to API
            const record = {
                custid,
                jobtype,
                jobstatus: jobstatus,
                jobhost: jobhost,
                jobtask: jobtask,
                initialTime: initialTime,
                lastUpdateTime: initialTime
            }
            const newRecord = await Data.add(record)
            response.writeHead(201, {'Content-Type': 'application/json'})
            return response.end(JSON.stringify(newRecord))
    }
    } catch (error) {
        console.log(error)
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
        let { jobtype, jobstatus, jobhost, jobtask } = JSON.parse(body)
        const recordData = {
            custid: record.custid,
            jobtype: jobtype || record.jobtype,
            jobstatus: jobstatus || record.jobstatus,
            jobhost: jobhost || record.jobhost,
            jobtask: jobtask || record.jobtask
        }
        const updatedRecord = await Data.update(recordData, identifier)
        return response.end(JSON.stringify(updatedRecord))
    }
    } catch (error) {
        console.log(error)
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
    }

}

async function assignWork() {
    const output = await getOldestUnassignedJobUuid()
    console.log(output)
    return 0;
}

module.exports = {
    getData,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    assignWork
}