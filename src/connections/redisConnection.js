const Redis = require('ioredis');
const config = require("../config/config");

const redis = new Redis(config.redis.port, config.redis.host);

redis.on('error', function (err) { });
redis.on('connect', function (err) {
    console.log('connected to redis successfully');
});

module.exports = redis;