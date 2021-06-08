const { getData, getItem, addItem, updateItem, deleteItem, assignWork } = require('./controllers/jobs')
const { loadFromFile, arrayFromRootJsonProperty } = require('./utils.js')
const http = require('http')
const port = process.env.NODEPORT || 5000
const server = http.createServer((request, response) => {
    console.log(request.url, request.method)
    let identifier = undefined
    if (request.url.match(/\/([a-z0-9]+)\/([a-z0-9]+)\/([a-zA-Z0-9=]+$)/)) {
        identifier = request.url.split('/').pop()
    }
    if (identifier) {
        if (request.method === 'GET' && request.url.match(/\/api\/request\/([a-zA-Z0-9=]+$)/)) {
            // identifier is sdehostname
            console.log('Processing request for work from ' + identifier)
            response.writeHead(200, { 'Content-Type': 'application/json' })

            // collect jobs data from jobs local file filtered to jobstatus: new
            const jobData = JSON.parse(loadFromFile('./data/jobs.json')).filter(
                record => record.jobstatus.toString().toLowerCase() === 'new'
            )
            // create an array based on the jobData initialTime property
            const jobDates = arrayFromRootJsonProperty(jobData, 'initialTime')
                // make sure all items are dates, future date undefined to 2100
                .map(d => d === undefined ? new Date('2100/01/01') : new Date(d))

            // remap dates as strings and find index of string
            const oldestDateIndex = jobDates.map(d => d.toString())
                .indexOf(new Date(Math.min.apply(null, jobDates)).toString())

            // assign oldest available new status job to requesting engine
            assignWork(request, response, jobData[oldestDateIndex], identifier)
        } else if (request.method === 'PUT' && request.url.includes('/api/jobs')) {
            updateItem(request, response, identifier)
        } else if (request.method === 'DELETE' && request.url.includes('/api/jobs')) {
            deleteItem(request, response, identifier)
        } else {
            // default to 'GET'
            getItem(request, response, identifier)
        }
    } else {
        if (request.url.includes('/api/jobs')) {
            if (request.method === 'POST') {
                addItem(request, response)
            } else {
                // default to 'GET'
                getData(request, response)
            }
        } else {
            // not found did not match any above
            response.writeHead(404, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({'message': 'route not found'}))
        }
    }
})


server.listen(port, () => console.log(`Server is running on port #${port}`))
