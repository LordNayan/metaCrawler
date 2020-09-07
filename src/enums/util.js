const config = require("../config/config");
const _ = require("lodash");
const httpContext = require('express-http-context');
const ErrorStackParser = require('error-stack-parser');
const moment = require('moment');
const logLevel = config.logging.logLevel;

module.exports = {
    error: function (message = 'ERROR', code = 400, httpCode = 400) {
        let status = {
            error_code: code,
            error_msg: message,
            http_code: httpCode
        };
        return status;
    },

    log: function (message = "", startTime = "", level = "info", errorObj = "") {
        try {
            let endTime = "", error_message = "";
            let done = httpContext.get('done');
            let url = httpContext.get('url');
            let print = httpContext.get('print');
            let logString = httpContext.get('logString');
            let time = moment().format("YYYY-MM-DD h:m:s")

            if (!_.isEmpty(startTime)) {
                endTime = process.hrtime(startTime);
            }
            if (_.isEmpty(endTime)) {
                if (logLevel == level) {
                    logString += `${level}:: ${time}:: ${message}\n`;
                    httpContext.set('logString', logString);
                }
            }
            else {
                endTime = Math.round(((endTime[0] * 1000) + (endTime[1] / 1000000)));
                if (level == "error") {
                    if (!done) {
                        if (errorObj.hasOwnProperty("message")) {
                            error_message = errorObj.message;
                        }
                        if (errorObj.hasOwnProperty("assetDetails")) {
                            errorObj = JSON.parse(JSON.stringify(errorObj));
                            delete (errorObj.assetDetails);
                        }
                        if (errorObj.hasOwnProperty("stack")) {
                            errorObj = ErrorStackParser.parse(errorObj)[0];
                            errorObj = { error_message, ...errorObj }
                        }
                        errorObj = JSON.stringify(errorObj);
                        logString += `${level}:: ${time}:: ${message}:: time_taken:: ${endTime} ms\n`;
                        logString += `${errorObj}\n`;
                        httpContext.set('logString', logString);
                        httpContext.set('done', 1);
                    }
                    else {
                        logString += `${level}:: ${time}:: ${message}:: time_taken:: ${endTime} ms\n`;
                        httpContext.set('logString', logString);
                    }
                }
                else {
                    if (logLevel == level) {
                        logString += `${level}:: ${time}:: ${message}:: time_taken:: ${endTime} ms\n`;
                        httpContext.set('logString', logString);
                    }
                }
            }
            if (print) {
                if (!_.isEmpty(logString)) {
                    if (config.logging.debug_speed) {
                        if (endTime > config.logging.min_speed) {
                            console.log(`URL - ${url}\n`)
                            console.log(logString);
                            console.log("----------------------------------------------------------------------------------");
                        }
                    }
                    else {
                        console.log(`URL - ${url}\n`)
                        console.log(logString);
                        console.log("----------------------------------------------------------------------------------");
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    },

    print: function () {
        httpContext.set('print', 1);
    }
}