const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.error(err.stack);
    console.log('UNHANDLED EXCEPTION!, SHUTTING DOWN....');
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);
//connection to DATABASE

//local
// mongoose.connect(process.env.DATABASE_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
// }).then(() => console.log('DB connection established!'));;

//atlas
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('DB connection established!'));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`app running at ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.error(err.stack);
    console.log('UNHANDLED REJECTION!, SHUTTING DOWN....');
    server.close(() => {
        process.exit(1);
    });
});
