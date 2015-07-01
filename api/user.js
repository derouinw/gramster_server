// api/user.js
// Loads a user from database based on id
// Bill - 6/30/2015
var cradle = require('cradle');
var express = require('express');
var router = express.Router();

var dbUsers = new(cradle.Connection)().database('gramster_users');

// Handle /api/user/[id]
router.get('/:id', function(req, res) {
  console.log('Load user: ' + req.params.id);

  dbUsers.get(req.params.id, function(err, doc) {
    if (err) {
      console.log('Error loading user: ' + err);
      res.writeHead(400);
      res.end('Error loading user');
      return err;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(doc));
    res.end();
  });
});

// Handle being sent a new user
router.post('/', function(req, res) {
  console.log('Create user');
  var body = '';

  req.on('data', function(chunk) {
    body += chunk.toString();
  });

  req.on('end', function() {
    if (body != null) {
      console.log('Received package: ' + body);
      var data = JSON.parse(body);

      dbUsers.save(data, function(err, response) {
        if (err) {
          console.log('Error adding user: ' + err);
          res.writeHead(400);
          res.end('Error adding user');
        }

        console.log('Add user successful: ' + response);
        res.end('User added');
        body = '';
      });
    }
  });
});

module.exports = router;
