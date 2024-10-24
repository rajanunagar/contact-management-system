const express = require('express');
const router = express.Router();

const { sendOtp, varifyOtp } = require('../controllers/otpController');

router.route('/').post(sendOtp);
router.post('/varify', varifyOtp);
module.exports = router;