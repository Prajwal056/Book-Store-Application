const mongoose = require('mongoose');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    timestamps: true
};

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['author', 'admin', 'retailUser'],
        default: 'retailUser'
    }
}, options);

const User = mongoose.model('User', userSchema);
// create to find role authors

User.findAllAuthors = async function () {
    return await this.find({ role: 'author' });
}

module.exports = User;
