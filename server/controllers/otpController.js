const asyncHandler = require('express-async-handler');
const otpGenerator = require('otp-generator');
const OTP = require('../models/otpModel');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const tempmailgen = require('tempmailgen');

const mailSender = async (res, email, title, body) => {
    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },
    },
    );
    var mailOptions = {
        from: {
            name: 'CMS',
            email: process.env.MAIL_USER
        },
        to: email,
        subject: title,
        text: 'Congratulation!! Registration Successful',
        html: body,
    };
    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            //console.log('mail sender', error.message);
            res.status(400).json({ success: false, message: error.message });
        } else {
            if (info.envelope == '') {
                res.status(400).json({ success: false, message: 'Not a valid email Id' });
            }
            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully',
                email: email
            });
        }
    });

}

const sendOtp = async (req, res) => {
    const { email } = req.body;
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
        return res.status(400).json({
            success: false,
            message: 'User is already registered',
        });
    }
    let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
    });
    let result = await OTP.findOne({ otp: otp });
    while (result) {
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
        });
        result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    const mailResponse = await mailSender(res,
        email,
        "Verification Email",
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #c5ecee;
            border-radius: 8px;
            box-shadow: 4px 3px 5px gray;
            text-align: center;
        }
        .header {
            padding-bottom: 20px;
            border-bottom: 2px solid #007bff;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #333;
            font-size: 24px;
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .content p {
            font-size: 18px;
            color: #333;
            margin: 0 0 20px;
        }
        .otp-code {
            display: inline-block;
            font-size: 24px;
            color: #ffffff;
            background-color: #007bff;
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: bold;
        }
        .footer {
            padding: 20px;
            font-size: 14px;
            color: #666;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CMS Registration</h1>
        </div>
        <div class="content">
            <p>Thank you for registering with our CMS. To complete your registration, please use the OTP code below:</p>
            <div class="otp-code">${otp}</div>
        </div>
        <div class="footer">
            <p>If you did not request this registration, please ignore this email or contact support.</p>
            <p><a href="#">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
`
    );
};

const varifyOtp = asyncHandler(async (req, res) => {
    const { otp, email } = req.body;
    if (!email || !otp) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {

        res.status(400);
        throw new Error('Otp is not valid');
    }
    res.status(200).json({ message: 'Email Varified Successfully' });
}
);

module.exports = {
    sendOtp,
    mailSender,
    varifyOtp
};