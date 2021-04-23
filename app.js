const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const csp = require('express-csp');
const compression = require('compression');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARE

//serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//set security http headers
app.use(helmet());

// //content security policy workaround: cp
csp.extend(app, {
    policy: {
        directives: {
            'default-src': ['self'],
            'style-src': ['self', 'unsafe-inline', 'https:'],
            'font-src': ['self', 'https://fonts.gstatic.com'],
            'script-src': [
                'self',
                'unsafe-inline',
                'data',
                'blob',
                'https://js.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:8828',
                'ws://localhost:56558/'
            ],
            'worker-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                'ws://localhost:*/'
            ],
            'frame-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                'ws://localhost:*/'
            ],
            'img-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                'ws://localhost:*/'
            ],
            'connect-src': [
                'self',
                'unsafe-inline',
                'data:',
                'blob:',
                // 'wss://<HEROKU-SUBDOMAIN>.herokuapp.com:<PORT>/',
                'https://*.stripe.com',
                'https://*.mapbox.com',
                'https://*.cloudflare.com/',
                'https://bundle.js:*',
                'ws://localhost:*/'
            ]
        }
    }
});

//development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//limit no of requests from a single IP
const limiter = rateLimit({
    max: 250,
    windowMs: 60 * 60 * 1000,
    message:
        'You have reached max requests in an hour(250), please try again in an hour'
});
app.use('/api', limiter);

//Parse request body as JSON
app.use(
    express.json({
        limit: '10kb'
    })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//removes malicious queries in body, Data sanitization against NoSQL query injection
//ex: in req.body of login email : {$gt : ""} and any correct password is provided. then user with that password is logged in.
app.use(mongoSanitize());

//Data sanitization against xss
app.use(xss());

//Preventing parameter pollution, This makes sure that the query string ?sort=name&sort=price does not create an error.
//white listed elements can be of this form ?duration=3&duration=5

app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverage',
            'ratingsQuantity',
            'maxGroupSize',
            'price',
            'difficulty'
        ]
    })
);

app.use(compression());

//test middleware
app.use((req, res, next) => {
    // console.log('from middleware');
    // console.log(req.cookies);
    next();
});

//convert req.reqtime to iso string
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    //initial :
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on server !`,
    // });
    //update : 1
    // const err = new Error(`Can't find ${req.originalUrl} on server !`);
    // err.statusCode = 404;
    // err.status = 'fail';
    //update : 2
    next(new AppError(`Can't find ${req.originalUrl} on server !`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
