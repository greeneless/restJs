const Product = require('../models/product')
const { getPostData } = require('../utils')

// change to function getData
// @desc    Retrieve bulk
// @route   GET /api/jobs/
async function getProducts(request, response) {
    try {
        const products = await Product.findAll()

        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(products))
    } catch (error) {
        console.log(error)
    }

}

// change to function getItem
// @desc    Inquire
// @route   GET /api/jobs/:id
async function getProduct(request, response, id) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const product = await Product.findById(id)
        if (!product) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {
            response.end(JSON.stringify(product))
        }
    } catch (error) {
        console.log(error)
    }

}

// change to function addItem 
// @desc    Update
// @route   POST /api/jobs/
async function addProduct(request, response) {
    try {
        const body = await getPostData(request)
        const { title, description, price } = JSON.parse(body)
        const product = {
            title,
            description,
            price
        }
        const newProduct = await Product.add(product, "0003")
        response.writeHead(201, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(newProduct))
    } catch (error) {
        console.log(error)
    }
}

// change to function updateItem 
// @desc    Update
// @route   PUT /api/jobs/:id
async function updateProduct(request, response, id) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const product = await Product.findById(id)
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
        const updatedProduct = await Product.update(productData, "0003")
        return response.end(JSON.stringify(updatedProduct))
    }
    } catch (error) {
        console.log(error)
    }
}


// change to function delItem
// @desc    Delete record
// @route   DELETE /api/jobs/:id
async function deleteProduct(request, response, id) {
    try {
        response.writeHead(200, { 'Content-Type': 'application/json' })

        const product = await Product.findById(id)
        if (!product) {
            response.end(JSON.stringify({'message': 'record not found'}))
        } else {
            await Product.del(id)
            response.end(JSON.stringify({'message': `record removed. id: ${id}`}))
        }
    } catch (error) {
        console.log(error)
    }

}

module.exports = {
    getProducts,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct
}
