const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Please add a fullname'],
        maxLength: 50,
        minLength: 4
    },
    email: {
        type: String,
        required: [true, 'Please add a email'],
        maxLength: 50,
        unique: [true, 'email has already taken']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    username: {
        type: String,
        required: [true, 'Please add a username'],
        maxLength: 20,
        minLength: 3,
        unique: [true, 'username has already taken']
    },
    gender: {
        type: String,
        required: [true, 'Please add a gender'],
        enum: ["Male", "Female", "Other"]
    },
    image: {
        type: String
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
},
    {
        timestamps: true,
    });

module.exports = mongoose.model('User', userSchema);