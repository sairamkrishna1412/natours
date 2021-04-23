const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

//connection to DATABASE

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => console.log('DB connection established!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
// console.log(devData);
// console.log(typeof devData);
// devData.forEach((el, ind) => {
//     delete el.id;
//     Tour.create(el)
//         .then(() => {
//             console.log(`${ind}th element done`);
//         })
//         .catch((err) => {
//             console.log('something went wrong', err);
//         });
// });
const importTours = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
        console.log('imported all docs');
        process.exit();
    } catch (err) {
        console.log('something went wrong', err);
    }
};

const deleteTours = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('deleted all documents');
        process.exit();
    } catch (err) {
        console.log('err');
    }
};
// console.log(process.argv);
if (process.argv[2] === '-import') importTours();
else if (process.argv[2] === '-delete') deleteTours();

// deleteTours();
// importTours();
