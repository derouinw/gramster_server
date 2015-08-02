// api/image.js
// Handles image api calls
// Bill - 6/30/2015
var express = require('express');
var global = require('../global');
var bodyParser = require('body-parser');
var router = express.Router();
var client = require('mongodb').MongoClient;

router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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
          db.close();
        });
      });
    }
  });
});

// Update an image
router.post('/:id', function(req, res) {
  console.log('Updating image: ' + req.params.id);

  var like = req.body.likes;
  var comment = req.body.comment;

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
  } else if (comment != null) {
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

        var comments = items[0].comments;
        comments.push(comment);

        db.collection('posts').updateOne(
          { '_id' : req.params.id },
          { $set: {
              'comments' : comments,
              'updated' : Date.now()
          }}, function(err, results) {
            console.log('Comment posted');
            res.end();
        });
      });
    });
  }
});

module.exports = router;
