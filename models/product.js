const products = require('../data/products')
const { writeToFile } = require('../utils')

function findAll() {
    return new Promise((resolve, reject) => {
        resolve(products)
    })
}

function findById(id) {
    return new Promise((resolve, reject) => {
        const product = products.find((p) => p.id === id)
        resolve(product)
    })
}

function add(product, identifer) {
    return new Promise((resolve, reject) => {
        const newProduct = {id: identifer,...product}
        products.push(newProduct)

        writeToFile('./data/products.json', products)
        resolve(newProduct)
    })
}


module.exports = {
    findAll,
    findById,
    add
}