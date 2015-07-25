// global.js
// Holds various global variables
// Bill - 6/30/2015

module.exports = {
  'HOST' : 'http://gramster.herokuapp.com',
  'HOST_LOCAL' : 'http://127.0.0.1',
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
  'DB_URL' : 'mongodb://gramster:password@ds053718.mongolab.com:53718/heroku_sp5vvkfq',
  'AWS_ACCESS_KEY' : process.env.AWS_ACCESS_KEY_ID,
  'AWS_SECRET_KEY' : process.env.AWS_SECRET_ACCESS_KEY,
  'S3_BUCKET' : process.env.S3_BUCKET_NAME,
  'S3_HOST' : 'http://gramster-images.s3.amazonaws.com/',
  'fileSize' : 	function(filename) {
 					var stats = fs.statSync(filename)
 					var fileSizeInBytes = stats["size"]
 					return fileSizeInBytes
				}
};
