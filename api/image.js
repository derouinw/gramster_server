// api/image.js
// Handles image api calls
// Bill - 6/30/2015
var cradle = require('cradle');
var express = require('express');
var router = express.Router();

var dbImages = new(cradle.Connection)().database('gramster_images');

// Handle /api/image/[id]
router.get('/view/:id', function(req, res) {
  console.log('Load image: ' + req.params.id);

  dbImages.get(req.params.id, function(err, doc) {
    if (err) {
      console.log('Error loading image: ' + err);
      res.writeHead(400);
      res.end('Error loading image');
      return err;
    }

    console.log('Sending image: ' + req.params.id);
    res.writeHead(200, { 'Content-Type': 'application/json' });

    // Make sure its sending a valid path
    if (!(doc.path.indexOf('http://') == 0 || doc.path.indexOf('/images/') == 0)) {
        doc.path = '/images/' + doc.path;
    }

    res.write(JSON.stringify(doc));
    res.end();
  });
});

// Handle /api/image/recent
router.get('/recent', function(req, res) {
  console.log('Load recent images');

  dbImages.all(function(err, doc) {
    if (err) {
      console.log('Error loading recent images: ' + err);
      res.writeHead(400);
      res.end('Error loading recent');
      return err;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(doc));
    res.end();
  });
});

// Handle being sent a new image
router.post('/', function(req, res) {
  console.log('Create image');
  var body = '';

  req.on('data', function(chunk) {
    body += chunk.toString();
  });

  req.on('end', function() {
    if (body != null) {
      console.log('Received package: ' + body);
      var data = JSON.parse(body);

      dbImages.save(data, function(err, response) {
        if (err) {
          console.log('Error adding image: ' + err);
          res.writeHead(400);
          res.end('Error adding image');
        }

        console.log('Add image successful: ' + response);
        res.end('Image added');
        body = '';
      });
    }
  });
});

module.exports = router;
