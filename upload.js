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
var aws = require('aws-sdk');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var FormData = require('form-data');
var router = express.Router();

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
		console.log('S3 uploading: ' + filename);

		var type = mime.lookup(filename);
		var extension = filename.split(/[.]+/).pop();

		if (IMAGE_TYPES.indexOf(type) == -1) {
			console.log('Upload filetype not supported');
			return res.status(415).send('Supported image formats: jpeg, jpg, png');
		}

		var id = uid(22);
		var targetName = id + '.' + extension;

		file.name = targetName;
		upload_signed_file(file);
	});

	/*req.busboy.on('file', function(fieldname, file, filename) {
		console.log('Uploading: ' + filename);

		var type = mime.lookup(filename);
		var extension = filename.split(/[.]+/).pop();

		if (IMAGE_TYPES.indexOf(type) == -1) {
			console.log('Upload filetype not supported');
			return res.status(415).send('Supported image formats: jpeg, jpg, png');
		}

		var id = uid(22);
		var targetName = id + '.' + extension;
		var targetPath = path.join(TARGET_PATH, targetName);

		fstream = fs.createWriteStream(targetPath);
		file.pipe(fstream);
		fstream.on('close', function() {

			var image_data = {
				_id : id,
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
					'Location' : global.HOST_LOCAL + ':' + global.PORT + global.SITE_IMAGE_VIEW + id });
				res.end();
			});
		});
	});*/

	
});

module.exports = router;

// ====================
// == S3 upload code ==
// ====================
function get_signed_request(file){
    console.log('Get signed request');
    /*var xhr = new XMLHttpRequest();
    xhr.open("GET", "/sign_s3?file_name="+file.name+"&file_type="+file.type);
    xhr.onreadystatechange = function(){
        console.log('State changed');
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                console.log('Response: ' + xhr.responseText);
                var response = JSON.parse(xhr.responseText);
                upload_file(file, response.signed_request, response.url);
            }
            else{
                alert("Could not get signed URL.");
            }
        }
    };
    xhr.send();*/
    var response = JSON.parse(sign_request(file.name, file.type));
    console.dir(response);
    upload_file(file, response.signed_request, response.url);
}

function upload_signed_file(file) {
	console.log("Upload signed file");

	console.log('Signing request');
  	aws.config.update({accessKeyId: global.AWS_ACCESS_KEY, secretAccessKey: global.AWS_SECRET_KEY});
	var s3 = new aws.S3();
	/*var s3_params = {
		Bucket: global.S3_BUCKET,
		Key: file.name,
		Expires: 60,
		ContentType: file.type,
		ACL: 'public-read'
	};

	s3.getSignedUrl('putObject', s3_params, function(err, data){
		if(err){
		  console.log(err);
		} else{
			var return_data = {
				signed_request: data,
				url: 'https://'+global.S3_BUCKET+'.s3.amazonaws.com/'+file.name
			};
			console.log('Return data: ' + JSON.stringify(return_data));

			console.log('Upload file');
			var xhr = new XMLHttpRequest();
			xhr.open("PUT", return_data.signed_request);
			xhr.setRequestHeader('x-amz-acl', 'public-read');
			xhr.onload = function() {
			    alert("File uploaded");
			};
			xhr.onerror = function() {
			    console.log("Headers: " + xhr.getAllResponseHeaders());
			    alert("Could not upload file.");
			};

			var formData = new FormData();
    		formData.append("theFile", file);
    		console.dir(formData);
			xhr.send(JSON.stringify(formData));
		}
	});*/

	s3.putObject({
	    Bucket: global.S3_BUCKET,
	    Key: file.name,
	    Body: file,
	    ContentLength: fileSize(file)
	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			console.log(data);
		}
	});
}

function upload_file(file, signed_request, url){
    console.log('Upload file');
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signed_request);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.onload = function() {
        alert("File uploaded");
    };
    xhr.onerror = function() {
        console.log("Headers: " + xhr.getAllResponseHeaders());
        alert("Could not upload file.");
    };

    xhr.send(file);
}

function sign_request(file_name, file_type) {
	console.log('Signing request');
  	aws.config.update({accessKeyId: global.AWS_ACCESS_KEY, secretAccessKey: global.AWS_SECRET_KEY});
	var s3 = new aws.S3();
	var s3_params = {
		Bucket: global.S3_BUCKET,
		Key: file_name,
		Expires: 60,
		ContentType: file_type,
		ACL: 'public-read'
	};

	s3.getSignedUrl('putObject', s3_params, function(err, data){
		if(err){
		  console.log(err);
		} else{
		  var return_data = {
		    signed_request: data,
		    url: 'https://'+global.S3_BUCKET+'.s3.amazonaws.com/'+file_name
		  };
		  console.log('Return data: ' + JSON.stringify(return_data));
		  return JSON.stringify(return_data);
		}
	});
}

function fileSize(filename) {
	var stats = fs.statSync(filename);
	var fileSizeInBytes = stats["size"];
	return fileSizeInBytes;
}
