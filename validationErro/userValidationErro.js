const joi = require('joi');

module.exports = joi.object( {
      username:joi.string().required(),
      email:joi.string().email().required('hello'),
      password:joi.string().required()
});
