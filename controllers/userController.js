const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const extension = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//     }
// });

// file will now be stored in buffer and can be accessed using req.file.buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! please upload an image.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    //reading file from buffer.
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...fields) => {
    Object.keys(obj).forEach(el => {
        if (!fields.includes(el)) {
            delete obj[el];
        }
    });
    return obj;
};

exports.getAllUsers = factory.getAll(User);

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find();
//     // console.log(tours);
//     res.status(200).json({
//         status: 'success',
//         results: users.length,
//         data: {
//             users
//         }
//     });
// });
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    //1 . check if only user data is being updated and not passwords.
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This is not for updating password. please use /updatePassword route for updating password.'
            )
        );
    }

    //2. update password
    const filteredReq = filterObj(req.body, 'name', 'email');
    //check if photo is uploaded using multer if yes then add it to filterObj so that it will be updated in database.
    if (req.file) filteredReq.photo = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredReq, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'please use /signup'
    });
};

exports.getUser = factory.getOne(User);

//do not change passwords using this func.
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
