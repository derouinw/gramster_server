// Requires
var http = require('http');
var url = require('url');
var cradle = require('cradle');
var bl = require('bl');

// Create the database
var dbUsers = new(cradle.Connection)().database('gramster_users');
var dbImages = new(cradle.Connection)().database('gramster_images');

// Create server to handle requests
var server = http.createServer(function(req, res) {
  var path = url.parse(req.url, true);
  var pathname = path.pathname.toString();
  console.log('Path requested: ' + pathname);

  // User functions
  if (req.method == 'GET') {
    if (pathname.indexOf('/api/user/') == 0 && pathname.length > '/api/user/'.length) {
      // View a user
      var user = pathname.substring('/api/user/'.length);
      console.log('View user: ' + user);

      dbUsers.get(user, function(err, doc) {
        if (err) {
          console.log('Error reading user: ' + err);
          res.writeHead(400);
          res.end('Error reading user');
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
    } else if (pathname.indexOf('/api/image/') == 0 && pathname.length > '/api/image/'.length) {
      // View an image
      var image = pathname.substring('/api/image/'.length);
      console.log('View image: ' + image);

      dbImages.get(image, function(err, doc) {
        if (err) {
          console.log('Error reading image: ' + err);
          res.writeHead(400);
          res.end('Error reading image');
          return err;
        }

        var response = {};
        response._id = doc._id;
        response.path = doc.path;
        response.title = doc.title;
        response.description = doc.description;
        response.author = doc.author;

        console.log(JSON.stringify(response));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      });
    } else if (pathname == '/api/recent/') {
      // View recent images
      console.log('View recent images');

      dbImages.all(function(err, doc) {
        if (err) {
          console.log('Error loading recent: ' + err);
          res.writeHead(400);
          res.end('Error loading recent');
          return err;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(doc.toString());
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
      if (pathname == '/api/user/') {
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
      } else if (pathname == '/api/image/') {
        var data = JSON.parse(body);
        console.log('Received package: ' + body);
        console.log('id: ' + data._id);
        console.log('title: ' + data.title);
        console.log('path: ' + data.path);
        dbImages.save(data, function(err, response) {
          if (err) {
            console.log('Error adding image: ' + err);
            req.writeHead(400);
            req.end('Error adding image');
          }

          console.log('Add image successful: ' + response);
          res.end('Image added');
          body = '';
        });
      }

      console.log('404');
      req.writeHead(404);
      req.end('Page not found');
    }
  });
});

// Start the server
server.listen(12345);
console.log('Gramster server started');
