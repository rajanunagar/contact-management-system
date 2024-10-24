const mongoose = require('mongoose');
const otpSchema = mongoose.Schema({
    email: {
        type: String,
        require: [true, 'Please add a Email']
    },
    otp: {
        type: String,
        require: [true, 'Please add a Otp']
    }, createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
    },
},
)

module.exports = mongoose.model('OTP', otpSchema);