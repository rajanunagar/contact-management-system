const Joi = require('joi');
const contactJoiSchema = Joi.object({
    fullname: Joi.string()
        .min(4)
        .max(50)
        .required()
        .messages({
            'string.base': 'Full Name should be a type of string',
            'string.empty': 'Full Name  cannot be an empty field',
            'string.min': 'Full Name  should have a minimum length of 4',
            'string.max': 'Full Name  should have a maximum length of 50',
            'any.required': 'Full Name  is a required field'
        }),

    phoneno: Joi.string()
        .pattern(/^[0-9-]+$/)
        .max(50)
        .required()
        .messages({
            'string.base': 'Phone No should be a type of string',
            'string.empty': 'Phone No cannot be an empty field',
            'string.max': 'Phone No should have a maximum length of 50',
            'any.required': 'Phone No is a required field',
            'string.pattern.base': 'Phone number must contain only digits and hyphens'
        }),
    code: Joi.string()
        .max(3)
        .min(0)
        .messages({
            'string.base': 'Code should be a type of string',
            'string.max': 'code should have a maximum length of 3',
        }),

    phonecategory: Joi.string()
        .required()
        .valid('Landline', 'Phone', 'Emergency')
        .messages({
            'string.base': 'Phone Category should be a type of string',
            'string.empty': 'Phone Category cannot be an empty field',
            'any.required': 'Phone Category is a required field',
            'any.only': 'Phone category must be one of Landline, Phone, Emergency',
        }),
    userid: Joi.string()
        .hex()
        .length(24)
        .messages({
            'string.base': 'User ID No should be a type of string',
            'string.hex': 'User ID should be a valid hexadecimal string',
        }),
})

module.exports = contactJoiSchema;