// user.js
// Web page for displaying a single user's profile
// Bill - 6/30/2015
var http = require('http');
var express = require('express');
var global = require('./global');
var router = express.Router();

// Handle /user/[id]
router.get('/:id', function(req, res) {
  console.log('View user: ' + req.params.id);

  http.get(global.HOST_LOCAL + ":"
           + global.PORT + '/api/user/'
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

      res.render('user', {
          title: data.name + '\' page',
          user: data.name,
          description: data.description
      });
      body = '';
    }
  });
 });
});

module.exports = router;
