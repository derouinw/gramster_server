// Requires
var http = require('http');
var url = require('url');
var cradle = require('cradle');
var bl = require('bl');

// Create the database
var dbUsers = new(cradle.Connection)().database('gramster_users');

// Create server to handle requests
var server = http.createServer(function(req, res) {
  var path = url.parse(req.url, true);
  var pathname = path.pathname.toString();
  console.log('Path requested: ' + pathname);

  // User functions
  if (pathname.indexOf('/user/') == 0) {
    // View a user
    if (req.method == 'GET' && pathname.length > '/user/'.length) {
      var user = pathname.substring(6);
      console.log('View user: ' + user);

      dbUsers.get(user, function(err, doc) {
        if (err) {
          console.log('Error reading user: ' + err);
          res.writeHead(400);
          res.end();
          return err;
        }

        var response = {};
        response._id = doc._id;
        response.name = doc.name;
        response.password = doc.password;
        response.description = doc.description;

        console.log(JSON.stringify(response));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      });
    }
  }

  // If sent data
  var body = '';
  req.on('data', function(data) {
    console.log('Data received: ' + data);
    body += data.toString();
  });

  req.on('end', function() {
    if (body != '') {
      // Add a user
      if (pathname == '/user/') {
        var data = JSON.parse(body);
        console.log('Received package: ' + body);
        console.log('id: ' + data._id);
        console.log('name: ' + data.name);
        dbUsers.save(data, function(err, response) {
          if (err) {
            console.log('Error adding user: ' + err);
            req.writeHead(400);
            req.end('Error adding user');
          }

          console.log('Add user successful: ' + response);
          res.end('User added');
          body = '';
        });
      }
    }
  })
});

// Start the server
server.listen(12345);
console.log('Gramster server started');
