const express = require('express');

console.log('Running api.js');

const router = express.Router();

// TODO: Remove once an actual endpoint is implemented
router.get('/test-api', function (req, res) {
    res.send({message:'API works!'});
});

console.log('Exporting api router');
module.exports = router;