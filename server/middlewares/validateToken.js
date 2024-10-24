const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let title = '';
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                title = "User is not authorized";
            }
            else {
                req.user = decoded.user;
                next();
            }
        });
        if (!token) title = "User is not authorized or token is missing";
    }
    else title = "token is missing";
    if (title) {
        res.status(401);
        throw new Error(title);
    }
});

module.exports = validateToken;
