// gramster_server.js
// Main entry point
// Bill - 6/30/2015
var http = require('http');
var global = require('./global');
var express = require('express');
var aws = require('aws-sdk');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

// Routers
var api = require('./api');
var image = require('./image');
var images = require('./images/images');
var upload = require('./upload');
app.use('/api', api);
app.use('/image', image);
app.use('/images', images);
app.use('/upload', upload);
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Homepage
app.get('/', function(req, res) {
  console.log('View index');

 res.render('index', {
   title: 'Gramster',
   message: 'Welcome to Gramster!'
 });
}); // get /

app.get('/sign_s3', function(req, res){
  console.log('Uploading');
  aws.config.update({accessKeyId: global.AWS_ACCESS_KEY, secretAccessKey: global.AWS_SECRET_KEY});
  var s3 = new aws.S3();
  var s3_params = {
    Bucket: global.S3_BUCKET,
    Key: req.query.file_name,
    Expires: 60,
    ContentType: req.query.file_type,
    ACL: 'public-read'
  };
  console.dir(s3_params);
  s3.getSignedUrl('putObject', s3_params, function(err, data){
    if(err){
      console.log(err);
    }
    else{
      var return_data = {
        signed_request: data,
        url: 'https://'+global.S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
      };
      console.log('Return data: ' + JSON.stringify(return_data));
      res.write(JSON.stringify(return_data));
      res.end();
    }
  });
});

var port = process.env.PORT || global.PORT;

// Start the server
var server = app.listen(parseInt(port), function() {
  var host = server.address().address;
  var port = server.address().port;

  global.PORT = port;

  console.log('Gramster server listening at http://%s:%s', host, port);
});
