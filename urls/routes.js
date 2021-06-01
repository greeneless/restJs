const { getProducts, getProduct, addProduct } = require('./controllers/product')

class Route {
    constructor(request, response) {
        this.route = request.url;
        this.method = request.method;
        this.id = this.route.split('/').pop()
    }
    isValidRoute() {
        let routeList = [
            '/api/products',
            '/api/jobs',
            '/api/applications'
        ]
        if (!routeList.includes(this.route)) {
            return false;
        }
        return true;
    }

    isValidId() {
        if (!this.id || typeof this.id !== 'number') {
            return false;
        }
        return true;
    }
    
    get() {
        if (!this.isValidRoute()) {
            throw 'Route is not part of valid routes list'
        }

        if (!this.isValidId()) {
            throw 'Invalid request identifier provided. Number expected.'
        }
        return getProducts();
    }
}