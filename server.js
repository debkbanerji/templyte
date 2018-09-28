// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

// Get our API routes
const api = require(path.join(__dirname, 'api', 'api.js'));

const app = express();
app.use(bodyParser.json());

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

let isDevMode = false;

process.argv.forEach(function (val) {
    if (/DEVELOP/.test(val)) {
        isDevMode = true;
    }
});

if (isDevMode) {
    console.log('RUNNING IN DEVELOPMENT MODE');

    // Add headers
    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Pass to next layer of middleware
        next();
    });
}

const frontendFolder = path.join(__dirname, 'static', 'templyte', 'dist', 'templyte');
// Point static path to frontend folder
app.use(express.static(frontendFolder));
console.log("Serving static from " + frontendFolder);

// Set our api routes
app.use('/api', api);

console.log("Setting api routes");

// Catch all other routes and return the index file
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendFolder, 'index.html'));
});

console.log("Catching all other routes and returning the index file");

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

console.log("Created Server");
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
    if (isDevMode) {
        console.log('\nPlease use \'npm run development-gui\' to start a development gui and navigate to localhost:4200');
        console.log('Node that the api is still running on port ' + port.toString())
    } else {
        console.log(`\nServer running on port: ${port}`);
    }
});
