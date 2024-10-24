const joi = require('joi');
const { constants } = require('../constant');
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode ? res.statusCode : 500;
    let title = '';
    if (err instanceof joi.ValidationError) {
        title = "validation done by joi";
        statusCode = 400;
    }
    else {
        switch (statusCode) {
            case constants.VALIDATION_ERROR:
                title = "Validation Failed";
                break;
            case constants.NOT_FOUND:

                title = "Not Found";
                break;

            case constants.UNAUTHORIZED:

                title = "Unauthorized";
                break;

            case constants.FORBIDDEN:

                title = "Forbidden";
                break;
            case constants.SERVER_ERROR:

                title = "Server Error";
                break;

            default:
                title = "Something Went wrong";
                statusCode = 500;
        }

    }

    res.status(statusCode).json({
        title: title,
        message: err.message,
        stackTrace: err.stack,
    });
}


module.exports = globalErrorHandler;