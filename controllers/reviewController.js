const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//      let filter = {}
//if (req.params.tourId) filter = { tour: req.params.tourId };
//     const reviews = await Review.find(filter);

//     if (!reviews) {
//         return next(new AppError('No reviews found. please try again'));
//     }

//     res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: {
//             reviews
//         }
//     });
// });

exports.setTourUserIds = (req, res, next) => {
    // if(!req.body.tour){
    //     //not completed
    //     if (!req.param.tourId) req.body.tour = await Tour
    // }
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.createReview = factory.createOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//     const review = await Review.create(req.body);

//     if (!review) {
//         return next(
//             new AppError('could not create a review. please try again.', 400)
//         );
//     }

//     res.status(201).json({
//         status: 'success',
//         data: {
//             review
//         }
//     });
// });
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
