const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value : ${Object.values(
        err.keyValue
    )}. please use another value`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    // const message = err.message.replace('Validation failed', 'Invalid input');
    const message = Object.values(err.errors)
        .map(el => el.message)
        .join('. ');
    return new AppError(`Invalid input : ${message}`, 400);
};

const handleJWTError = () =>
    new AppError(`Token is invalid. please login in again.`, 401);

const handleJWTExpiredError = () =>
    new AppError(`Token expired. please login in again.`, 401);

const sendErrorDev = function(res, req, err) {
    // console.log(err.errors);
    //API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        });
    }
    //below code will run only if above condition not satisfied, if it is satisfied then it will return directly and below code will not run
    //RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
    // console.log(err);
};

const sendErrorProd = (res, req, err) => {
    //API
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            //operational error
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        //programming or other error
        console.error('ERROR ', err);
        return res.status(500).json({
            status: 'error',
            message: 'something went wrong!'
        });
    }
    //RENDERED WEBSITE
    if (err.isOperational) {
        //operational error
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }

    //programming or other error
    console.error('ERROR ', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(res, req, err);
    } else if (process.env.NODE_ENV === 'production') {
        let error = Object.assign(err);
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(res, req, error);
    }
};
