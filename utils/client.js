const redis = require("redis");
const client = redis.createClient()

client.on('connect', function () {
    console.log('Connected to Redis');
});

module.exports = client
// backup
// const redis = require("redis");
// const password = '36QXXbOPiBAhf7iUJtOEuRWHbbTlcAhL'
// const client = redis.createClient({
//     host: 'redis-10845.c1.ap-southeast-1-1.ec2.cloud.redislabs.com',
//     port: 10845,
//     password: password
// });
// client.auth(password, function (err) {
//     if (err) throw err;
// });

// client.on('connect', function () {
//     console.log('Connected to Redis');
// });

// module.exports = client