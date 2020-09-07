const _ = require("lodash");
const validUrl = require('valid-url');
const util = require("../enums/util");

async function queryValidator(req, res, next) {
    try {
        const body = req.body;
        const url = body.hasOwnProperty("url") ? body.url : "";
        if (_.isEmpty(url)) {
            throw new Error("Url is a required parameter");
        }
        if (!validUrl.isUri(url)) {
            throw new Error("Invalid Url");
        }
        next();
    }
    catch (error) {
        error = util.error(error.message, "102");
        let statusCode = error.http_code;
        delete (error.http_code);
        res.status(statusCode).send(error);
        res.send(error.message);
    }
}

module.exports = queryValidator;