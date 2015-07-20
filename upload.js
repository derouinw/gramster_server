// upload.js
// Handles upload of images
// Bill - 7/19/2015
var http = require('http');
var express = require('express');
var global = require('./global');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var uid = require('uid2');
var request = require('request');
var busboy = require('connect-busboy');
var cassandra = require('cassandra-driver');
var router = express.Router();
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: global.KEYSPACE})

var TARGET_PATH = __dirname + '/images/';
var IMAGE_TYPES = ['image/jpeg', 'image/png'];

router.use(busboy());

router.get('/', function(req, res) {
	console.log('Upload image');

	res.render('upload', { message : "Upload an image" });
});

router.post('/', function(req, res) {
	var fstream;
	var title, description;
	req.pipe(req.busboy);

	req.busboy.on('field', function(fieldName, value) {
		if (fieldName == 'title') {
			title = value;
		} else if (fieldName == 'description') {
			description = value;
		}
	});

	req.busboy.on('file', function(fieldname, file, filename) {
		console.log('Uploading: ' + filename);

		var type = mime.lookup(filename);
		var extension = filename.split(/[.]+/).pop();

		if (IMAGE_TYPES.indexOf(type) == -1) {
			console.log('Upload filetype not supported');
			return res.status(415).send('Supported image formats: jpeg, jpg, png');
		}

		var targetName = uid(22) + '.' + extension;
		var targetPath = path.join(TARGET_PATH, targetName);

		fstream = fs.createWriteStream(targetPath);
		file.pipe(fstream);
		fstream.on('close', function() {
			var query = "SELECT value FROM last_id WHERE id_name='posts';";

			client.execute(query, function(err, result) {
				if (err) {
					console.log('Error getting new id');
					return res.status(500).send('Something went wrong?');
				}

				var image_id = result.rows[0].value+1;

				var image_data = {
					id: image_id,
					title: title,
					path: targetName,
					description : description
				};

				var url = global.HOST_LOCAL + ':' + global.PORT + global.API_IMAGE_NEW;

				request.post( {url : url, body : JSON.stringify(image_data)}, function(err, response, body) {
					if (err) {
						console.log('Upload failed: ' + err);
						return res.status(500).send('Upload went wrong');
					}

					console.log('Upload successful:' + body);
					res.writeHead(302, { 
						'Location' : global.HOST_LOCAL + ':' + global.PORT + global.SITE_IMAGE_VIEW + image_data.id });
					res.end();
				});

				var update_query = "UPDATE last_id SET value=? WHERE id_name='posts'";

				client.execute(update_query, [image_id], {prepare: true}, function(err, result) {
					if (err) {
						console.log('Update id went wrong');
					}
				});
			});			
		});
	});
});

module.exports = router;