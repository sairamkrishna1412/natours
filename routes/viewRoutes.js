const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
// const bookingController = require('../controllers/bookingController');

const router = express.Router();

// router.use((req, res, next) => {
//     res.set(
//         'Content-Security-Policy',
//         "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
//     );
//     next();
// });
router.use(viewController.alerts);

router.get(
    '/',
    // bookingController.createBoookingCheckout,
    authController.isLoggedIn,
    viewController.getOverview
);
router.get('/tour/:name', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getUserDetails);
router.get('/my-tours', authController.protect, viewController.getMyTours);
// router.post(
//     '/submit-user-data',
//     authController.protect,
//     viewController.updateUserData
// );
module.exports = router;
