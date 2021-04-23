const mongoose = require('mongoose');
const slugify = require('slugify');
// const catchAsync = require('../utils/catchAsync');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'name must be less than or equal to 40'],
            minlength: [10, 'name must be greater than or equal to 10']
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have duration']
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have size']
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message:
                    'Only 3 difficulty levels are available : easy, medium and difficult'
            }
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'rating must atleast be 1'],
            max: [5, 'rating cannot be greater than 5'],
            set: val => Math.round(val * 10) / 10
        },
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function(val) {
                    return val < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below regular price.'
            }
        },
        summary: {
            type: String,
            required: [true, 'A tour must have a summary'],
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],

        startLocation: {
            //Geojson
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        guides: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);
//virtual properties of tours :  properties that are not saved in DB but shown when API request is made
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
//document middleware
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {
        lower: true
    });
    next();
});

// for embedding users into tours as guides. not a good approach.
// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async function(id) {return await User.findById(id)})
//     // same as below
//     // const guidesPromises = this.guides.map(async (id) => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises);
//     next();
// })

//query middleware
tourSchema.pre(/^find/, function(next) {
    //below 2 lines do not work
    // this.find({ secretTour: false });
    // this.find({ secretTour: { $eq: false } });
    this.find({
        secretTour: {
            $ne: true
        }
    });
    next();
});

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChange'
    });
    next();
});
//aggregation middleware
// tourSchema.pre('aggregate', function(next) {
//     // console.log(this.pipeline());
//     this.pipeline().unshift({
//         $match: {
//             secretTour: {
//                 $ne: true
//             }
//         }
//     });
//     next();
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
