const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');

const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const User = require('../models/userModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1)get Tour from req.params
    const tour = await Tour.findById(req.params.tourID);
    //2)create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
        //     req.params.tourID
        // }&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get(
            'host'
        )}/my-tours/?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourID,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [
                    `${req.protocol}://${req.get('host')}/img/tours/${
                        tour.imageCover
                    }`
                ],
                amount: tour.price * 100,
                currency: 'INR',
                quantity: 1
            }
        ]
    });
    //3) send session as response
    res.status(200).json({
        status: 'success',
        session
    });
});

// exports.createBoookingCheckout = catchAsync(async (req, res, next) => {
//     //this is only temporary, because its unsecure and everyone can booking without paying
//     const { tour, user, price } = req.query;
//     if (!tour && !user && !price) return next();

//     await Booking.create({ tour, user, price });

//     //redirect again to root /, it will again call routehandler for '/'
//     res.redirect(req.originalUrl.split('?')[0]);

//     //how the function works: first when success_url is hit on getCheckoutSession function after booking tour, this function(createBookingCheckout) is called as it is in the middleware stack of '/' route handler in viewRoutes. tour,user & price are taken from the req.query and then after checking the if condition, new booking is created. then site will be redirected to main(root) page '/' again. so again all middleware functions will be called from the start. this time in createBookingCheckout function tour, user & price are not present on req.query . so the if condition fails and next() is returned as a result next middleware is called. this acts a small protection from users to book without paying money but is unsecure anyways. hence, it is a temporary soln.
// });
const createBookingCheckout = async session => {
    // console.log(session);
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.amount_total / 100;
    await Booking.create({ tour, user, price });
};
exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook error : ${err.message}`);
    }
    if (event.type === 'checkout.session.completed')
        createBookingCheckout(event.data.object);
    res.status(200).json({ recieved: true });
};

exports.getAllBookings = factory.getAll(Booking);

exports.getBooking = factory.getOne(Booking);

exports.createBooking = factory.createOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);

// exports.updateBooking = factory.updateOne(Booking);
