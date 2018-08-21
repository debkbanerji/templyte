const express = require('express');

console.log('Running api.js');

const router = express.Router();

// TODO: Remove once an actual endpoint is implemented
router.get('/test-api', function (req, res) {
    res.send('API works!');
});

console.log('Exporting router');
module.exports = router;