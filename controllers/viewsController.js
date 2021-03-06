const Tour = require('../models/tourModel');
// const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert === 'booking')
        res.locals.alert =
            'Booking Sucessful! if it does not appear here please visit this page after some time.';
    next();
};

exports.getOverview = catchAsync(async (req, res) => {
    //1) get data from tour
    const tours = await Tour.find();
    //2) build template
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    //1) get data from tour
    const tour = await Tour.findOne({ slug: req.params.name }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    let booking;
    let review;
    if (res.locals.user) {
        booking = await Booking.findOne({
            user: res.locals.user.id,
            tour: tour.id
        });
        review = await Review.findOne({
            user: res.locals.user.id,
            tour: tour.id
        });
    }
    if (!tour) return next(new AppError('no tour found with that name.', 404));
    //2) build template
    res.status(200).render('tour', {
        title: tour.name || '',
        tour,
        booking,
        review
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
};

exports.getSignupForm = function(req, res) {
    res.status(200).render('signup', {
        title: 'Sign up'
    });
};

exports.getUserDetails = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account',
        user: res.locals.user
    });
};

exports.getMyTours = catchAsync(async (req, res) => {
    const { id } = req.user;
    const bookings = await Booking.find({ user: id });
    const tourIds = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });
    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});

exports.getMyReviews = catchAsync(async (req, res) => {
    const { id } = req.user;
    const reviews = await Review.find({ user: id }).populate({
        path: 'tour',
        select: 'imageCover name slug'
    });
    res.status(200).render('review', {
        title: 'My Reviews',
        reviews
    });
});

// exports.updateUserData = async (req, res, next) => {
//     const updatedUser = await User.findByIdAndUpdate(
//         req.user.id,
//         { name: req.body.name, email: req.body.email },
//         {
//             new: true,
//             runValidators: true
//         }
//     );
//     res.status(200).render('account', {
//         title: 'Your account',
//         user: updatedUser
//     });
// };
