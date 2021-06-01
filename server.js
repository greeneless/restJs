const { getProducts, getProduct, addProduct, updateProduct, deleteProduct } = require('./controllers/product')

const http = require('http')
const port = process.env.NODEPORT || 5000
const server = http.createServer((request, response) => {
    // let route = Route(request.url)
    // if (!route) {
    //     response.writeHead(404, { 'Content-Type': 'application/json' })
    //     response.end(JSON.stringify({'message': 'route not found'}))
    // } else {
    //     switch (request.method) {
    //         case 'GET':
    //             if (typeof parseInt(route.split('/').pop()) === 'number') {
    //                 route.get(request, response, productId)
    //             } else {
    //                 route.get(request, response)
    //             }
    //         case 'POST':
    //             return;
    //     }
    // }
    if (request.url === '/api/products' && request.method === 'GET') {
        getProducts(request, response)
    } else if (request.url === '/api/products' && request.method === 'POST') {
        addProduct(request, response)
    } else if (request.url.match(/\/([a-z0-9]+)\/([a-z0-9]+)\/([a-z0-9]+)/)) {
        const identifier = request.url.split('/').pop()
        if (request.method === 'PUT') {
            updateProduct(request, response, identifier)
        } else if (request.method === 'DELETE') {
            deleteProduct(request, response, identifier)
        } else {
            // default to 'GET'
            getProduct(request, response, identifier)
        }
    } else {
        // not found did not match any above
        response.writeHead(404, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({'message': 'route not found'}))
    }
})

server.listen(port, () => console.log(`Server is running on port #${port}`))


