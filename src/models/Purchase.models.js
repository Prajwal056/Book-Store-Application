const mongoose = require('mongoose');
const Book = require('./Book.models');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    timestamps: true
};

const purchaseSchema = new mongoose.Schema({
    purchaseId: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^\d{4}-\d{2}-\d+$/.test(v);
            },
            message: props => `${props.value} is not a valid purchaseId!`
        }
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        // validate: {
        //     validator: async function (v) {
        //         let book = await Book.findOne({ bookId: v });
        //         return book;
        //     },
        //     message: props => `${props.value} is not a valid bookId!`
        // },
        ref: 'Book'
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    purchaseDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number
    },
    bookCurrentPrice: {
        type: Number,
    }
}, options);

// purchaseSchema.pre('save', async function (next) {
//     try {

//         let book = await Book.findOne({ bookId: this.bookId });

//         if (!book) {
//             throw new Error('Book not found');
//         }
//         if (!book.price) {
//             throw new Error('Book price is undefined');
//         }
//         this.price = book.price * this.quantity;
//         this.bookCurrentPrice = book.price;
//         next();
//     } catch (error) {
//         console.error("Error in pre-save hook:", error);
//         next(error);
//     }
// });


const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
