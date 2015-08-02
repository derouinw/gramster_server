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

  console.log('Loading: ' + global.HOST_LOCAL + ':' + global.PORT
           + global.API_IMAGE_RECENT);
  http.get(global.HOST_LOCAL + ':' + global.PORT
           + global.API_IMAGE_RECENT,
           function(get_res) {
   var body = '';

   // Load the data
   get_res.on('data', function(chunk) {
     body += chunk.toString();
   });

   // Render the page
   get_res.on('end', function() {
     if (body != null) {
       console.log('Received: ' + body);
       var data = JSON.parse(body);
       var cb = 0, cb_done = 0;
       var images = [];

       for (var i = 0; i < data.length; i++) {
         images[i] = {};
         http.get(global.HOST_LOCAL + ':' + global.PORT + global.API_IMAGE_VIEW
                  + data[i]._id, function(get_image) {
          var index = cb++;
          var image_body = '';

          // Load the data
          get_image.on('data', function(chunk) {
            image_body += chunk.toString();
          });

          // Save the info
          get_image.on('end', function() {
            if (image_body != null) {
              var image_data = JSON.parse(image_body);
              console.log('Loaded image ' + index + ': ' + image_body);

              images[index].path = global.SITE_IMAGE_VIEW + image_data._id;
              images[index].title = image_data.title;
              images[index].time = image_data.time;
              cb_done++;

              // If all cb's have finished, render the page
              if (cb_done == data.length) {
                images.sort(images_compare);

                res.render('index', {
                  title: 'Gramster',
                  message: 'Welcome to Gramster!',
                  posts: images
                });
              }
            }
          }); // on(end)
        }); // get image
      } // for
     }
   }); // on(end)
 }); // get recent
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

function images_compare(a, b) {
  if (a.time > b.time) {
    return -1;
  } else if (a.time < b.time) {
    return 1;
  }
  return 0;
}
