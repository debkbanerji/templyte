const express = require('express');

console.log('Running api.js');

const router = express.Router();

// TODO: Remove once an actual endpoint is implemented
router.get('/test-api', function (req, res) {
    res.send({message:'API works!'});
});

router.post('/download-template', (req, res) => {
    data = req.body;
    console.log("recevie data from client")
    console.log(data);
    // TODO: send rendered zip file back to client.
    res.send({data}); 
});

console.log('Exporting api router');
module.exports = router;