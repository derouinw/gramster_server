// api/image.js
// Handles image api calls
// Bill - 6/30/2015
var cassandra = require('cassandra-driver');
var express = require('express');
var global = require('../global');
var router = express.Router();
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: global.KEYSPACE})

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

      var query = 'INSERT INTO posts (id, title, path, description, time, likes, tags) VALUES (?,?,?,?,?,?,?);';
      var params = [
        data.id,
        data.title,
        data.path,
        data.description,
        Date.now(),
        0,
        ['#hashtag']
      ];
      client.execute(query, params, { prepare: true }, function(err) {
        if (err) {
          console.log('Error loading image: ' + err);
          res.status(400).send('Error loading image');
          return err;
        }

        console.log('Row updated');
        res.end('Db updated');
      });
    }
  });
});

module.exports = router;
