const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const httpContext = require('express-http-context');
const metaCrawl = require("../conrtrollers/metaCrawl");
const queryValidator = require("../middlewares/queryValidator");

router.use(bodyParser.json());

//Attach parameters to every request for custom logging
router.use(httpContext.middleware);
router.use(function (req, res, next) {
    httpContext.set('done', 0);
    httpContext.set('url', req.url);
    httpContext.set('logString', "");
    httpContext.set('print', 0);
    next();
});

//Get Meta route with queryValidator middleware
router.post('/get', [queryValidator], metaCrawl);

module.exports = router;