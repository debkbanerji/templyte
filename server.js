// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');

// Get our API routes
const api = require(path.join(__dirname, 'api', 'api.js'));

const app = express();

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);
console.log("Node server running on port " + port);

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
server.listen(port, () => console.log(`Server running on port: ${port}`));
