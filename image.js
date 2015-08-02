// image.js
// Serves page for viewing images
// Bill - 6/30/2015
var http = require('http');
var express = require('express');
var global = require('./global');
var bodyParser = require('body-parser');
var router = express.Router();
var client = require('mongodb').MongoClient;

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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
          path: global.S3_HOST + data.path,
          description: data.description,
          time: data.time,
          likes: data.likes,
          tags: data.tags,
          comments: data.comments
        });
        body = '';
     }
   });

  });
});

// Update the post
router.post('/:id', function(req, res) {
  console.log('Update post: ' + req.params.id);

  var like = req.body.likes;

  if (like == 'true') {
    client.connect(global.DB_URL, function(err, db) {
      if (err) {
        console.log('Error updating image: ' + err);
        res.writeHead(400);
        res.end('Error updating image');
        return err;
      }

      db.collection('posts').find({ "_id" : req.params.id }).limit(1).toArray(function(err, items) {
        if (err) {
          console.log('Error updating image: ' + err);
          res.writeHead(400);
          res.end('Error updating image');
          return err;
        }

        likes = items[0].likes + 1;
        db.collection('posts').updateOne(
          { '_id' : req.params.id },
          { $set: {
              'likes' : likes,
              'updated' : Date.now()
          }}, function(err, results) {
            console.log('Post liked');
            res.end();
          }); // update
      }); // find
    }); // connect
  }
});

module.exports = router;
