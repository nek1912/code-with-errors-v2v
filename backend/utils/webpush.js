const webpush = require('web-push');
require('dotenv').config();

webpush.setVapidDetails(
  'mailto:safesphere@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = webpush;
