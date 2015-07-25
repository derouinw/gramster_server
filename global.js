// global.js
// Holds various global variables
// Bill - 6/30/2015
var os = require('os');

var hostname = os.hostname();
console.log("host: " + hostname);

module.exports = {
  'HOST' : 'http://192.168.1.54',
  'HOST_LOCAL' : 'http://gramster.herokuapp.com/',
  'PORT' : '',
  'API_IMAGE_VIEW' : '/api/image/view/',
  'API_IMAGE_RECENT' : '/api/image/recent/',
  'API_IMAGE_NEW' : '/api/image/',
  'API_USER_VIEW' : '/api/user/',
  'API_USER_NEW' : '/api/user/',
  'SITE_IMAGE_VIEW' : '/image/',
  'IMAGE_PATH' : '/images/',
  'KEYSPACE' : 'gramster',
  'RECENT_NUMBER' : 10,
  'DB_URL' : 'mongodb://gramster:password@ds053718.mongolab.com:53718/heroku_sp5vvkfq'
};
