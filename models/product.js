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

function update(product, id) {
    return new Promise((resolve, reject) => {
        const index = products.findIndex((p) => p.id === id)
        products[index] = {id, ...product}

        writeToFile('./data/products.json', products)
        resolve(products[index])
    })
}

function del(id) {
    return new Promise((resolve, reject) => {
        let filteredProducts = products.filter((p) => p.id !== id)
        writeToFile('./data/products.json', filteredProducts)
        resolve()
    })
}



module.exports = {
    findAll,
    findById,
    add,
    update,
    del
}