module.exports = {
    port: 3000,
    axios: {
        timeout: 5000 //http call timeout in milliseconds
    },
    redis: {
        host: "127.0.0.1",
        port: 6379,
        ttl: 18000 //18000 seconds = 5 hours
    },
    logging: {
        debug_speed: 0, //get logs for only those requests which took time > min_speed milliseconds
        min_speed: 500, // 500 ms
        logLevel: "info",//info or error (choose error if want only error logs)
    },
    test: {
        testUrl: 'https://www.youtube.com/watch?v=pg17kp1s83U&list=RDMMO6_5aEn-dwE&index=8&ab_channel=BulkyB.'
    }
}   