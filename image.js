// image.js
// Serves page for viewing images
// Bill - 6/30/2015
var http = require('http');
var express = require('express');
var global = require('./global');
var router = express.Router();

// Handle /image/[id]
router.get('/:id', function(req, res) {
  console.log('View image: ' + req.params.id);

  http.get(global.HOST_LOCAL + ":"    // 127.0.0.1:3000/api/image/[id]
         + global.PORT + global.API_IMAGE_VIEW
         + req.params.id,
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

       res.render('image', {
          title: data.title,
          path: global.HOST_LOCAL + ':' + global.PORT + global.IMAGE_PATH + data.path,
          description: data.description,
          time: data.time,
          likes: data.likes,
          tags: data.tags
        });
        body = '';
     }
   });

  });
});

module.exports = router;
