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
  var id = req.params.id;

  console.log('Load image: ' + id);

  client.connect(global.DB_URL, function(err, db) {
    if (err) {
      console.log('Error loading image: ' + err);
      res.writeHead(400);
      res.end('Error loading image');
      return err;
    }

    var cursor = db.collection('posts').find({ "_id" : id });
    cursor.each(function(err, doc) {
      if (err) {
        console.log('Error loading image: ' + err);
        res.writeHead(400);
        res.end('Error loading image');
        return err;
      }

      if (doc != null) {
        res.send(doc);
        db.close();
        return;
      } else {
        db.close();
        return;
      }
    });
  });
});

// Handle /api/image/recent
router.get('/recent', function(req, res) {
  console.log('Load recent images');

  client.connect(global.DB_URL, function(err, db) {
    if (err) {
      console.log('Error loading image: ' + err);
      res.writeHead(400);
      res.end('Error loading image');
      return err;
    }

    var cursor = db.collection('posts').find().limit(global.RECENT_NUMBER).sort( { "updated" : -1 });
    var result = [];
    cursor.each(function(err, doc) {
      if (err) {
        console.log('Error loading image: ' + err);
        res.writeHead(400);
        res.end('Error loading image');
        return err;
      }

      if (doc != null) {
        result.push(doc);
      } else {
        res.send(JSON.stringify(result));
        db.close();
      }
    });
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
          console.log('Error uploading image: ' + err);
          res.status(400).send('Error uploading image');
          return err;
        }

        data.time = Date.now();
        data.updated = Date.now();
        data.likes = 0;
        data.tags = [];
        data.comments = [];
        db.collection('posts').insertOne(data, function(err, result) {
          if (err) {
            console.log('Error uploading image: ' + err);
            res.status(400).send('Error uploading image');
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
