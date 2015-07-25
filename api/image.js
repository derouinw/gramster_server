// api/image.js
// Handles image api calls
// Bill - 6/30/2015
var express = require('express');
var global = require('../global');
var router = express.Router();
var uuid = require('node-uuid');
var client = require('mongodb').MongoClient;

// Handle /api/image/[id]
router.get('/view/:id', function(req, res) {
  console.log('Load image: ' + req.params.id);

  var id = parseInt(req.params.id);

  var query = 'SELECT * FROM posts where id=?;';
  client.execute(query, [id], { prepare : true }, function(err, result) {
    if (err) {
      console.log('Error loading image: ' + err);
      res.writeHead(400);
      res.end('Error loading image');
      return err;
    }

    var obj = result.rows[0];
    console.log('Loaded image: ' + obj.title);

    res.send(obj);
  });
});

// Handle /api/image/recent
router.get('/recent', function(req, res) {
  console.log('Load recent images');

  var query = 'SELECT * FROM posts;';
  client.execute(query, function(err, result) {
    if (err) {
      console.log('Error loading image: ' + err);
      res.writeHead(400);
      res.end('Error loading image');
      return err;
    }

    if (result.rows.length > global.RECENT_NUMBER) {
      res.send(result.rows.slice(0, global.RECENT_NUMBER));
    } else {
      res.send(result.rows);
    }
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

      client.connect(global.DB_URL, function(err, db) {
        if (err) {
          console.log('Error loading image: ' + err);
          res.status(400).send('Error loading image');
          return err;
        }

        data._id = uuid.v1();
        data.time = Date.now();
        data.likes = 0;
        data.tags = [];
        data.comments = [];
        db.collection('posts').insertOne(data, function(err, result) {
          if (err) {
            console.log('Error loading image: ' + err);
            res.status(400).send('Error loading image');
            return err;
          }

          console.log('Row updated');
          res.end('Db updated');
        });
        db.close();
      });
    }
  });
});

module.exports = router;
