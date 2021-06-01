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

// change to function getItem
// @desc    Inquire
// @route   GET /api/jobs/:id
async function getItem(request, response, id) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const record = await Data.findById(id)
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
        let { custid, jobtype, jobstatus, jobhost } = JSON.parse(body)
        if (!jobstatus) {
            jobstatus = null
        }

        if (!jobhost) {
            jobhost = null
        }
        const record = {
            custid,
            jobtype,
            jobstatus: jobstatus,
            jobhost: jobhost
        }
        const newRecord = await Data.add(record)
        response.writeHead(201, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(newRecord))
    } catch (error) {
        console.log(error)
    }
}

// change to function updateItem 
// @desc    Update
// @route   PUT /api/jobs/:id
async function updateItem(request, response, id) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const product = await Data.findById(id)
        if (!product) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {

        const body = await getPostData(request)
        const { title, description, price } = JSON.parse(body)
        const productData = {
            title: title || product.title,
            description: description || product.description,
            price: price || product.price
        }
        const updatedProduct = await Data.update(productData, "0003")
        return response.end(JSON.stringify(updatedProduct))
    }
    } catch (error) {
        console.log(error)
    }
}


// change to function delItem
// @desc    Delete record
// @route   DELETE /api/jobs/:id
async function deleteItem(request, response, id) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const product = await Data.findById(id)
        if (!product) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {
            await Data.del(id)
            response.end(JSON.stringify({'message': `record removed. id: ${id}`}))
        }
    } catch (error) {
        console.log(error)
    }

}

module.exports = {
    getData,
    getItem,
    addItem,
    updateItem,
    deleteItem
}
