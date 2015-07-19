// api.js
// Main entry point for all api calls
// Bill - 6/30/2015
var express = require('express');
var image = require('./api/image');
var router = express.Router();

router.use('/image', image);

router.get('/', function(req, res) {
  res.send('Welcome to the gramster api!');
});

module.exports = router;
