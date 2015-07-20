// global.js
// Holds various global variables
// Bill - 6/30/2015
module.exports = {
  'HOST' : 'http://192.168.1.54',
  'HOST_LOCAL' : 'http://10.123.129.165',
  'PORT' : process.env.PORT || 3000,
  'API_IMAGE_VIEW' : '/api/image/view/',
  'API_IMAGE_RECENT' : '/api/image/recent/',
  'API_IMAGE_NEW' : '/api/image/',
  'API_USER_VIEW' : '/api/user/',
  'API_USER_NEW' : '/api/user/',
  'SITE_IMAGE_VIEW' : '/image/',
  'IMAGE_PATH' : '/images/',
  'KEYSPACE' : 'gramster',
  'RECENT_NUMBER' : 10
};
