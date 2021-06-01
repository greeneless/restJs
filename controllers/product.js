const Product = require('../models/product')

async function getProducts(request, response) {
    try {
        const products = await Product.findAll()

        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(products))
    } catch (error) {
        console.log(error)
    }

}

async function getProduct(request, response, id) {
    try {
        const product = await Product.findById(id)
        if (!product) {
            response.writeHead(200, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({'message': 'no content'}))
        } else {
            response.writeHead(200, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify(product))
        }
    } catch (error) {
        console.log(error)
    }

}

async function addProduct(request, response) {
    try {
        const product = { 'title': 'test product', 'description': 'this is my product', 'price': 100}

        const newProduct = Product.add(product, "0001")
        response.writeHead(201, {'Content-Type': 'application/json'})
        return response.end(JSON.stringify(newProduct))

    } catch (error) {
        console.log(error)
    }

}

module.exports = {
    getProducts,
    getProduct,
    addProduct
}
