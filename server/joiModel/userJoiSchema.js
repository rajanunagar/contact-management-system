

const Joi = require('joi');

const userJoiSchema = Joi.object({
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

    email: Joi.string()
        .email()
        .max(50)
        .required()
        .messages({
            'string.base': 'Email should be a type of string',
            'string.empty': 'Email cannot be an empty field',
            'string.email': 'Email must be a valid email address',
            'string.max': 'Email should have a maximum length of 50',
            'any.required': 'Email is a required field'
        }),
    username: Joi.string()
        .max(20)
        .required()
        .min(3)
        .messages({
            'string.base': 'Username should be a type of string',
            'string.empty': 'Username cannot be an empty field',
            'string.max': 'Username should have a maximum length of 20',
            'any.required': 'Username is a required field',
            'string.min': 'UserName should have a minimum length of 3',
        }),

    password: Joi.string()
        .required()
        .messages({
            'string.base': 'Password should be a type of string',
            'string.empty': 'Password cannot be an empty field',
            'any.required': 'Password is a required field',
        }),
    gender: Joi.string()
        .required()
        .valid('Male', 'Female', 'Other')
        .messages({
            'string.base': 'Gender should be a type of string',
            'string.empty': 'Gender cannot be an empty field',
            'any.required': 'Gender is a required field',
            'any.only': 'Gender must be one of Male, Female, Other',
        }),
    image: Joi.string()
        .messages({
            'string.base': 'Image should be a type of string',
        }),
    role: Joi.string()
        .messages({
            'string.base': 'Role should be a type of string',
        }),

});

module.exports = userJoiSchema;
