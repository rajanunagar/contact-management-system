const mongoose = require('mongoose');
const contactSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Please add a fullname'],
        maxLength: 50,
        minLength: 4
    },
    phoneno: {
        type: String,
        required: [true, 'Please add a phoneno'],
        maxLength: 50,
    },
    code: {
        type: String,
        maxLength: 3,
    },
    phonecategory: {
        type: String,
        required: [true, 'Please add a phonecategory'],
        enum: ["Landline", "Phone", "Emergency"]
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        timestamps: true,
    });

module.exports = mongoose.model('Contact', contactSchema);