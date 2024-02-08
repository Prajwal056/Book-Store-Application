const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const User = require('./User.models');
mongoose.plugin(slug);

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    timestamps: true
};

const bookSchema = new mongoose.Schema({
    bookId: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^book-\d+$/.test(v);
            },
            message: props => `${props.value} is not a valid bookId!`
        }
    },
    authors: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        // validate: {
        //     validator: async function (v) {
        //         let authors = await User.find({ username: { $in: v }, role: 'author' });
        //         return authors.length === v.length;
        //     },
        //     message: props => `${props.value} is not a valid author!`
        // }
    },
    sellCount: {
        type: Number,
        default: 0
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        slug: "title", // This indicates that the 'title' field will be used to generate the slug
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 100,
        max: 1000
    },
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            rating: { type: Number, required: true },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    averageRating: { type: Number, default: 0 } // To store the average rating of the book
}, options);

const Book = mongoose.model('Book', bookSchema);

Book.findByBookId = async function (bookId) {
    return this.findOne({ bookId });
};

module.exports = Book;
