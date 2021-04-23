module.exports = class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        //creating new queryObj so that we dont modify req.query
        // console.log(this.queryStr);
        const queryObj = { ...this.queryStr };
        const excludedQueries = ['sort', 'page', 'limit', 'fields'];
        excludedQueries.forEach(el => delete queryObj[el]);

        let strQuery = JSON.stringify(queryObj);
        strQuery = strQuery.replace(
            /\b(gte|gt|lt|lte)\b/g,
            match => `$${match}`
        );

        const fQuery = JSON.parse(strQuery);
        this.query = this.query.find(fQuery);
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            //sort
            const sortBy = this.queryStr.sort.split(',').join(' ');
            // console.log(sortBy);
            this.query = this.query.sort(sortBy);
        }
        // else {
        //     this.query = this.query.sort('-ratingsAverage');
        // }
        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const reqFields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(reqFields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 25;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
};
