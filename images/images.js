// images.js
// Handles binary sending of image data
// Bill - 7/4/2015
var fs = require('fs');
var express = require('express');
var router = express.Router();

// Handle /images/[path]
router.get('/:path', function(req, res) {
	fs.open('./images/' + req.params.path, 'r', function(err, fd) {
		if (err) {
			console.log('Error finding image ' +req.params.path + ': ' + err);
			res.writeHead(400);
			res.end('Error finding image');
			return err;
		}

		var options = {
			root: __dirname
		};

		console.log('Sending image: ' + req.params.path);
		res.sendFile(req.params.path, options);
	});
});

module.exports = router;
