// upload.js
// Handles upload of images
// Bill - 7/19/2015
var express = require('express');
var global = require('./global');
var router = express.Router();

router.get('/', function(req, res) {
	console.log('Upload page');

	res.render('upload', { message : "Upload an image" });
});

module.exports = router;
