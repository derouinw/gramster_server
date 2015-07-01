// gramster_server.js
// Main entry point
// Bill - 6/30/2015
var http = require('http');
var global = require('./global');
var express = require('express');
var app = express();

// Routers
var api = require('./api');
var user = require('./user');
var image = require('./image');
app.use('/api', api);
app.use('/user', user);
app.use('/image', image);
app.set('view engine', 'jade');

// Homepage
app.get('/', function(req, res) {
  console.log('View index');

  http.get(global.HOST_LOCAL + ':'
           + global.PORT
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
         http.get(global.HOST_LOCAL + ':'
                  + global.PORT + global.API_IMAGE_VIEW
                  + data[i].id, function(get_image) {
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
              cb_done++;

              // If all cb's have finished, render the page
              if (cb_done == data.length) {
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

// Start the server
//server.listen(12345);
var server = app.listen(parseInt(global.PORT), function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Gramster server listening at http://%s:%s', host, port);
});
