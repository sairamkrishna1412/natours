const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/sendEmail');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createAndSendToken = (user, statusCode, req, res) => {
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    };

    res.cookie('jwt', token, cookieOptions);

    //does not output password
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        // passwordChangedAt: req.body.passwordChangedAt
        role: req.body.role
    });
    // const url = `${req.protocol}://${req.get('host')}/me`;
    //send Email
    // await new Email(newUser, url).sendWelcome();

    createAndSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    //1.check if email and password exist
    if (!email || !password) {
        return next(new AppError('please enter email and password', 400));
    }
    //2.check if user exists
    const user = await User.findOne({ email: email }).select('+password');
    if (!user) {
        return next(
            new AppError('Incorrect email or Account does not exist.', 404)
        );
    }
    //2.check if password matches
    const passMatch = await user.correctPassword(password, user.password);
    if (!passMatch) {
        return next(new AppError('Incorrect password.', 401));
    }
    createAndSendToken(user, 200, req, res);
});

exports.logout = (req, res, next) => {
    res.cookie('jwt', 'loggedOut', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    //1 check if token exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token)
        return next(
            new AppError(
                'You are not logged in. please log in to get access.',
                401
            )
        );

    //2 verfication of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3 check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError('User of this token is deleted', 401));
    }

    //4 check if user has not changed his password after the token is isued, if password is changed then token should be invalid
    const changedPassword = user.changedPassword(decoded.iat);
    if (changedPassword) {
        return next(
            new AppError('This is not valid anymore. please log in again!', 401)
        );
    }
    //GRANT ACCESS TO RESOURCE ONLY IF ALL CONDITIONS ARE SATISFIED
    req.user = user;
    res.locals.user = user;

    next();
});

exports.isLoggedIn = async (req, res, next) => {
    //1 check if token exists
    if (req.cookies.jwt) {
        try {
            //2 verfication of token
            const decoded = await promisify(jwt.verify)(
                req.cookies.jwt,
                process.env.JWT_SECRET
            );

            //3 check if user still exists
            const user = await User.findById(decoded.id);
            if (!user) {
                return next();
            }

            //4 check if user has not changed his password after the token is isued, if password is changed then token should be invalid
            const changedPassword = user.changedPassword(decoded.iat);
            if (changedPassword) {
                return next();
            }
            //THERE IS A LOGGED IN USER.
            res.locals.user = user;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You are not Authorized to perform this action.',
                    403
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1 get user email based on posted email
    const { email } = req.body;
    const user = await User.findOne({
        email: email
    });
    if (!user) {
        return next(new AppError('This email does not exist.', 404));
    }

    //2 generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false
    });

    //3 send token to user email
    //api
    const resetUrl = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // const message = `Forgot password? send a PATCH request with new password and confirm password to ${resetUrl} to update new password. if you did not forget your password please ignore babe :*`;

    try {
        await new Email(user, resetUrl).sendPasswordReset();
        // await sendEmail({
        //     email,
        //     subject: 'Password reset token. valid for 10 min.',
        //     message
        // });
        res.status(200).json({
            status: 'success',
            message: `Reset token sent to ${email}.`
        });
    } catch {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        });
        return next(
            new AppError(
                'Reset token could not be sent. please try again.',
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1. get token from user.
    if (!req.params.token) {
        return next(new AppError('Please enter a token.', 400));
    }

    //2.Encrypt token
    const encyptedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //3.get user by encrypted token and validate token , user is null if either the there is no user with that token or if token has expired.
    const user = await User.findOne({
        passwordResetToken: encyptedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });

    if (!user) {
        return next(
            new AppError(
                'Either the user does not exist or this token has expired, please generate a new token.'
            )
        );
    }
    //4. update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //log in user
    createAndSendToken(user, 200, req, res);
});

exports.udpatePassword = catchAsync(async (req, res, next) => {
    //1.get user from collection
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return next(new AppError('You are not logged in. please log in!', 400));
    }
    //2.check current pass and entered password
    const passwordMatch = await user.correctPassword(
        req.body.password,
        user.password
    );
    if (!passwordMatch) {
        return next(
            new AppError('passwords do not match. please try again!', 401)
        );
    }
    //3. update new pass
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();

    //4. log in user
    createAndSendToken(user, 200, req, res);
});
