const User = require('../models/userModel');
const Contact = require('../models/contactModel');
const OTP = require('../models/otpModel');
const { mailSender } = require('./otpController');
const userJoiSchema = require('../joiModel/userJoiSchema');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const {applyPaginationAndFilterOnList} = require('../common/function');

// Utility functions

const validateGender = (gender) => {
    const validGenders = ['Male', 'Female', 'Other'];
    return validGenders.includes(gender);
};

const handleFileUpload = async (file, oldImage) => {
    if (file) {
        if (oldImage) {
            const oldFilePath = `./public/Images/${oldImage}`;
            try {
                await fs.promises.access(oldFilePath);
                await fs.promises.unlink(oldFilePath);
            } catch (error) {
                console.error('File deletion error:', error);
            }
        }
        return file.filename;
    }
    return oldImage;
};

const hashPassword = async (password) => await bcrypt.hash(password, 10);

const verifyUserAndOtp = async (email, otp) => {
    let user = await User.findOne({ email });
    if (user) throw new Error('Email already exists');
    const otpRecord = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (otpRecord.length === 0 || otp !== otpRecord[0].otp) throw new Error('Otp is not valid');
};

const checkUserRole = (role) => {
    if (role !== 'user' && role) throw new Error('Role cannot be other than user');
};

const validateUserFields = (fields) => {
    const { fullname, username, gender } = fields;
    if (!fullname || !username || !gender) throw new Error("All fields are mandatory!");
    if (!validateGender(gender)) throw new Error("Gender must be one of Male, Female, Other");
};

const handleSessionAndFileDeletion = async (id, user, session) => {
    await Contact.deleteMany({ userid: id }).session(session);
    await User.findByIdAndDelete(id).session(session);
    if (user.image) {
        const filePath = `./public/Images/${user.image}`;
        try {
            await fs.promises.access(filePath);
            await fs.promises.unlink(filePath);
        } catch (error) {
            console.error('File deletion error:', error);
        }
    }
};

const isUserIsAdmin = asyncHandler((req, res, next) => {
    if (req.user.isAdmin) {
        next();
    }
    else throw new Error("Don't have permission to access this resource");
});

// Controller methods

const registerUser = asyncHandler(async (req, res, next) => {
    try {
        const user = req.body;
        const { email, password, otp, role } = user;
        delete user.otp;
        await userJoiSchema.validateAsync(user);
        if (!otp) throw new Error('Otp is required field');
        checkUserRole(role);
        await verifyUserAndOtp(email, otp);
        user.password = await hashPassword(password);
        const filePath = await handleFileUpload(req.file, '');
        user.image = filePath;
        // const userResponse = await User.create(user);
        try {
                        userResponse = await User.create(user);
                        res.status(201).json(userResponse);
                    }
                    catch (error) {
                        res.status(400);
                        if (error.code === 11000) {
                            throw new Error(`Username : '${username}' already occupied by someone.`);
                        } else {
                            throw new Error(error);
                        }
            }
    } catch (error) {
        if (req.file) {
            const filePath = `./public/Images/${req.file.filename}`;
            try {
                await fs.promises.access(filePath);
                await fs.promises.unlink(filePath);
            } catch (error) {
                console.error('File deletion error:', error);
            }
        }
        next(error);
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("All fields are mandatory!");
    let user = await User.findOne({ $or: [{ username: email }, { email: email }] });
    if (!user) throw new Error('User Not Found');
    if (await bcrypt.compare(password, user.password)) {
        const isAdmin = user.role === 'admin';
        const user1 = {
            id: user._id,
            email: user.email,
            username: user.username,
            isAdmin: isAdmin
        };
        const token = jwt.sign({
            user: user1
        }, process.env.SECRET_KEY, { expiresIn: "30m" });
        res.status(200).json({ ...user1, access_token: token });
    } else {
        throw new Error("Email or password is not valid");
    }
});

const getUsers = asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const size = Number(req.query.size || 10);
    const name = req.query.name;
    const offset = (page - 1) * size;
    const query = User.aggregate([
        { $match: { role: { $ne: 'admin' } } },
        { $lookup: { from: 'contacts', localField: '_id', foreignField: 'userid', as: 'contacts' } },
        { $addFields: { contactCount: { $size: '$contacts' } } },
        { $project: { fullname: 1, email: 1, username: 1, gender: 1, image: 1, contactCount: 1 } }
    ]);
    let users;
    let totalRecords;
    if (page === -1) {
        //without pagination
        users = await query;
        totalRecords = users.length;
    } else {
        //with pagination
        const result = await applyPaginationAndFilterOnList(query,size,offset,name,page);
        users=result.list;
        totalRecords=result.totalRecords; 
    }
    res.status(200).json({ users, length:totalRecords });
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new Error('User Not Found');
    res.status(200).json(user);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new Error('User Not Found');
    res.status(200).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
    validateUserFields(req.body);
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        if (!user) throw new Error('User Not Found');
        res.status(200).json(user);
    } catch (error) {
        if (error.code === 11000) throw new Error(`Username already occupied by someone.`);
        throw new Error(error);
    }
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
    const { fullname, gender } = req.body;
    if (!fullname || !gender) {
        res.status(400);
        throw new Error("All fields are mandatory!");
    }
    if (!(gender === "Male" || gender === "Female" || gender === "Other")) {
        res.status(400);
        throw new Error("Gender must be one of Male, Female, Other");
    }
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) throw new Error('User Not Found');
        res.status(200).json(user);
    } catch (error) {
        throw new Error(error);
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const id = req.user.id;
    const user = await User.findById(id);
    if (!user) throw new Error('User Not Found');
    if (user.role === "admin") throw new Error('Admin cannot be deleted');
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        await handleSessionAndFileDeletion(id, user, session);
        await session.commitTransaction();
        res.status(200).json(user);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

const deleteUserByAdmin = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) throw new Error('User Not Found');
    if (user.role === "admin") throw new Error('Admin cannot be deleted');
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        await handleSessionAndFileDeletion(id, user, session);
        await session.commitTransaction();
        res.status(200).json(user);
    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

const updateUserPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) throw new Error("Password is Mandatory");
    try {
        const hashedPassword = await hashPassword(password);
        const user = await User.findByIdAndUpdate(req.user.id, { password: hashedPassword }, { new: true });
        if (!user) throw new Error('User Not Found');
        res.status(200).json(user);
    } catch (error) {
        throw new Error(error);
    }
});

const sendForgetPasswordLink = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const oldUser = await User.findOne({ $or: [{ username: email }, { email: email }] });
    if (!oldUser) throw new Error('User Not Found');
    const secret = process.env.SECRET_KEY + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "30m" });
    const link = `http://localhost:5001/api/user/reset-password/${oldUser._id}/${token}`;
    const body = `<div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #c5ecee; padding: 20px; border-radius: 8px; box-shadow: 4px 3px 5px gray;">
            <h2 style="color: #333;">CMS</h2>
            <p style="font-size: 16px; line-height: 1.5;">
                Hi ${oldUser.fullname},<br><br>
                You requested to reset your password.<br>
                Please click the link below to reset your password:
            </p>
            <a href="${link}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 16px; text-decoration: none; color: #fff; background-color: #007bff; border-radius: 5px;">Reset Password</a>
        </div>
    </div>`;
    await mailSender(res, oldUser.email, 'Reset Password', body);
});

const getResetPasswordForm = asyncHandler(async (req, res) => {
    const { id, token } = req.params;
    const oldUser = await User.findOne({ _id: id });
    if (!oldUser) throw new Error('User Not Found');

    const secret = process.env.SECRET_KEY + oldUser.password;
    try {
        const verify = jwt.verify(token, secret);
        res.render("index", { email: verify.email, status: "Not Verified", error: '' });
    } catch (error) {
        res.status(400).send("Not Verified");
    }
});

const postResetPasswordForm = asyncHandler(async (req, res) => {
    const { id, token } = req.params;
    const { password, confirmpassword } = req.body;
    let validationError = '';
    if (!password || !confirmpassword) {
        validationError = 'both field are required';
    }
    if (password.length < 4) {
        validationError = 'Password must be at least 4 character long';
    }
    if (password !== confirmpassword) {
        validationError = 'Password and confirm password must be same';
    }
    try {
        const oldUser = await User.findOne({ _id: id });
        if (!oldUser) {
            res.status(404);
            throw new Error('User Not Found');
        }
        const secret = process.env.SECRET_KEY + oldUser.password;
        const verify = jwt.verify(token, secret);
        if (validationError) {
            res.render("index", { email: verify.email, status: "verified", error: validationError });
        } else {
            const encryptedPassword = await bcrypt.hash(password, 10);
            await User.updateOne(
                {
                    _id: id,
                },
                {
                    $set: {
                        password: encryptedPassword,
                    },
                }
            );
            res.render("index", { email: verify.email, status: "verified", error: '' });
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message ? error.message : "Something Went Wrong");
    }
});

const addOrUpdateUserImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) throw new Error('User Not Found');
    const filePath = await handleFileUpload(req.file, user.image);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { image: filePath }, { new: true });
    res.status(200).json({ message: user.image ? "Image updated successfully" : "Image added successfully" });
});

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getCurrentUser,
    getUserById,
    updateUser,
    updateUserByAdmin,
    deleteUser,
    deleteUserByAdmin,
    updateUserPassword,
    sendForgetPasswordLink,
    getResetPasswordForm,
    postResetPasswordForm,
    addOrUpdateUserImage,
    isUserIsAdmin
};






























// const User = require('../models/userModel');
// const asyncHandler = require('express-async-handler');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const userJoiSchema = require('../joiModel/userJoiSchema');
// const mongoose = require('mongoose');
// const Contact = require('../models/contactModel');
// const OTP = require('../models/otpModel');
// const { mailSender } = require('./otpController');
// const fs = require('fs');


// //without global async handler.
// const registerUser = async (req, res, next) => {
//     try {
//         //joi validate reqest body
//         const user = req.body;
//         const { fullname, gender, email, username, password, otp, role } = user;
//         delete user.otp;
//         await userJoiSchema.validateAsync(user);
//         if (!otp) {
//             res.status(400);
//             throw new Error('Otp is required field');
//         }
//         if (role !== 'user' && role) {
//             res.status(400);
//             throw new Error('role can not be other then user');
//         }

//         //check this email alreday exit or not
//         let userResponse = await User.findOne({ email: email });
//         if (userResponse) {
//             res.status(400);
//             throw new Error('Email already exists');
//         }
//         const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
//         if (response.length === 0 || otp !== response[0].otp) {

//             res.status(400);
//             throw new Error('Otp is not valid');
//         }
//         //hash password using bcrypt
//         user.password = await bcrypt.hash(password, 10);
//         const filePath = req.file && req.file.filename ? req.file.filename : '';
//         try {
//             userResponse = await User.create({ ...user, image: filePath });
//             res.status(201).json(userResponse);
//         }
//         catch (error) {
//             res.status(400);
//             if (error.code === 11000) {
//                 throw new Error(`Username : '${username}' already occupied by someone.`);
//             } else {
//                 throw new Error(error);
//             }
//         }
//     }
//     catch (error) {
//         if (req.file && req.file.filename) {
//             const filePath = `./public/Images/${req.file.filename}`;
//             try {
//                 await fs.promises.access(filePath);
//                 await fs.promises.unlink(filePath);
//             }
//             catch (error) {
//                 console.error('File deletion error:', error);
//             }
//         }
//         return next(error);
//     }
// };

// const loginUser = asyncHandler(async (req, res) => {

//     const { email, password } = req.body;
//     if (!email || !password) {
//         res.status(400);
//         throw new Error("All fields are mandatory!");
//     }
//     //check this email alreday exit or not
//     let userResponse = await User.findOne({ $or: [{ username: email }, { email: email }] });
//     if (!userResponse) {
//         res.status(400);
//         throw new Error('User Not Found');
//     }

//     //hash password using bcrypt
//     if (await bcrypt.compare(password, userResponse.password)) {
//         const isAdmin = userResponse.role === 'admin';
//         const user = {
//             id: userResponse._id,
//             email: userResponse.email,
//             username: userResponse.username,
//             isAdmin: isAdmin
//         };
//         const token = jwt.sign({
//             user: user
//         },
//             process.env.SECRET_KEY,
//             {
//                 expiresIn: "30m"
//             }
//         );
//         res.status(200).json({ ...user, access_token: token });
//     } else {
//         res.status(401);
//         throw new Error("email or password is not valid");
//     }
// });


// const getUsers = asyncHandler(async (req, res) => {

//     if (req.user.isAdmin) {
//         const page = Number(req.query.page ? req.query.page : 1);
//         const size = Number(req.query.size ? req.query.size : 10);
//         const name = req.query.name;
//         const offset = (page - 1) * size;
//         let users;
//         let totalRecords;
//         const query = User.aggregate([
//             {
//                 $match: {
//                     role: { $ne: 'admin' }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'contacts',
//                     localField: '_id',
//                     foreignField: 'userid',
//                     as: 'contacts'
//                 }
//             },
//             {
//                 $addFields: {
//                     contactCount: { $size: '$contacts' }
//                 }
//             },
//             {
//                 $project: {
//                     fullname: 1,
//                     email: 1,
//                     username: 1,
//                     gender: 1,
//                     image: 1,
//                     contactCount: 1
//                 }
//             }
//         ]);

//         if (page === -1) {
//             users = await query;
//             totalRecords = User.length;
//         }
//         else {
//             const result = await query;
//             const filtered = result.filter(target => {
//                 if (!name) {
//                     return target;
//                 }
//                 else if (target.fullname.toLowerCase().includes(name.toLowerCase())) {
//                     return target;
//                 }
//                 else return false;
//             })
//             const totalPages = Math.ceil(filtered.length / size);
//             if (!totalPages) {
//                 res.status(400);
//                 throw new Error('No Record Found');
//             }
//             if (page > totalPages) {
//                 res.status(400);
//                 throw new Error('Page Not Found');
//             }
//             users = filtered.slice(offset, offset + size);
//             totalRecords = filtered.length;
//         }
//         res.status(200).json({ users: users, length: totalRecords });
//     }
//     else {
//         res.status(403);
//         throw new Error("Don't have permission to access this resource");
//     }

// });

// const getCurrentUser = asyncHandler(async (req, res) => {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//         res.status(400);
//         throw new Error('User Not Found');
//     }
//     res.status(200).json(user);
// });

// const getUserById = asyncHandler(async (req, res) => {
//     if (req.user.isAdmin) {
//         const user = await User.findById(req.params.id);
//         if (!user) {
//             res.status(400);
//             throw new Error('User Not Found');
//         }
//         res.status(200).json(user);
//     }
//     else {
//         res.status(403);
//         throw new Error("Don't have permission to access this resource");
//     }
// });

// const updateUser = asyncHandler(async (req, res) => {
//     const { fullname, username, gender } = req.body;
//     if (!fullname || !username || !gender) {
//         res.status(400);
//         throw new Error("All fields are mandatory!");
//     }
//     if (!(gender === "Male" || gender === "Female" || gender === "Other")) {
//         res.status(400);
//         throw new Error("Gender must be one of Male, Female, Other");
//     }
//     try {
//         const user = await User.findByIdAndUpdate(req.user.id, {
//             fullname: fullname,
//             username: username,
//             gender: gender
//         }, { new: true });
//         if (!user) {
//             res.status(404);
//             throw new Error('User Not Found');
//         }

//         res.status(200).json(user);
//     }
//     catch (error) {
//         res.status(400);
//         if (error.code === 11000) {
//             throw new Error(`Username : '${username}' already occupied by someone.`);
//         } else {
//             throw new Error(error);
//         }
//     }

// })

// const updateUserByAdmin = asyncHandler(async (req, res) => {
//     if (req.user.isAdmin) {

//         const { fullname, gender } = req.body;
//         if (!fullname || !gender) {
//             res.status(400);
//             throw new Error("All fields are mandatory!");
//         }
//         if (!(gender === "Male" || gender === "Female" || gender === "Other")) {
//             res.status(400);
//             throw new Error("Gender must be one of Male, Female, Other");
//         }
//         try {
//             const user = await User.findByIdAndUpdate(req.params.id, {
//                 fullname: fullname,
//                 gender: gender
//             }, { new: true });
//             if (!user) {
//                 res.status(404);
//                 throw new Error('User Not Found');
//             }

//             res.status(200).json(user);
//         }
//         catch (error) {
//             res.status(400);
//             throw new Error(error);
//         }
//     }
//     else {
//         res.status(403);
//         throw new Error("Don't have permission to access this resource");
//     }
// })
// const deleteUser = asyncHandler(async (req, res) => {
//     const id = req.user.id
//     const user = await User.findById(id);
//     if (!user) {
//         res.status(400);
//         throw new Error('User Not Found');
//     }
//     if (user.role === "admin") {
//         res.status(403);
//         throw new Error('admin can not be deleted');
//     }
//     const session = await mongoose.startSession(); // Start a session

//     try {
//         session.startTransaction(); // Start the transaction
//         await Contact.deleteMany({ userid: id }).session(session);
//         await User.findByIdAndDelete(id).session(session);
//         if (user.image) {
//             const filePath = `./public/Images/${user.image}`;
//             try {

//                 await fs.promises.access(filePath);
//                 await fs.promises.unlink(filePath);
//             }
//             catch (error) {
//                 console.error('File deletion error:', error);
//             }
//         }
//         await session.commitTransaction();

//         session.endSession();//end session

//         res.status(200).json(user);
//     } catch (err) {

//         await session.abortTransaction(); // Abort the transaction in case of error
//         session.endSession();
//         res.status(400);
//         throw new Error(err);
//     }
// });

// const deleteUserByAdmin = asyncHandler(async (req, res) => {
//     if (req.user.isAdmin) {
//         const id = req.params.id
//         const user = await User.findById(id);
//         if (!user) {
//             res.status(403);
//             throw new Error('User Not Found');
//         }
//         if (user.role === "admin") {
//             res.status(400);
//             throw new Error('admin can not be deleted');
//         }
//         const session = await mongoose.startSession(); // Start a session
//         // console.log(user);
//         try {
//             session.startTransaction(); // Start the transaction
//             await Contact.deleteMany({ userid: id }).session(session);
//             await User.findByIdAndDelete(id).session(session);
//             if (user.image) {
//                 const filePath = `./public/Images/${user.image}`;
//                 try {

//                     await fs.promises.access(filePath);
//                     await fs.promises.unlink(filePath);
//                 }
//                 catch (error) {
//                     console.error('File deletion error:', error);
//                 }

//             }
//             await session.commitTransaction();

//             session.endSession();//end session

//             res.status(200).json(user);
//         } catch (err) {

//             await session.abortTransaction(); // Abort the transaction in case of error
//             session.endSession();
//             res.status(400);
//             throw new Error(err);
//         }
//     }
//     else {
//         res.status(403);
//         throw new Error("Don't have permission to access this resource");
//     }
// }

// )


// const updateUserPassword = asyncHandler(async (req, res) => {
//     const { password } = req.body;
//     console.log('hello');
//     if (!password) {
//         res.status(400);
//         throw new Error("Password is Mandatory");
//     }
//     try {
//         const hashPassword = await bcrypt.hash(password, 10);
//         const user1 = await User.findByIdAndUpdate(req.user.id, {
//             password: hashPassword,
//         }, { new: true });
//         if (!user1) {
//             res.status(404);
//             throw new Error('User Not Found');
//         }

//         res.status(200).json(user1);
//     }
//     catch (error) {
//         res.status(400);
//         throw new Error(error);
//     }

// })

// const sendForgetPasswordLink = asyncHandler(async (req, res) => {
//     const { email } = req.body;

//     const oldUser = await User.findOne({ $or: [{ username: email }, { email: email }] });
//     if (!oldUser) {
//         res.status(404);
//         throw new Error('User Not Found');
//     }
//     const secret = process.env.SECRET_KEY + oldUser.password;
//     const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
//         expiresIn: "5m",
//     });
//     const link = `http://localhost:5001/api/user/reset-password/${oldUser._id}/${token}`;
//     const body = `<div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px; text-align: center;">
//     <div style="max-width: 600px; margin: 0 auto; background-color: #c5ecee; padding: 20px; border-radius: 8px; box-shadow: 4px 3px 5px gray;">
//         <h2 style="color: #333;">CMS</h2>
//         <p style="font-size: 16px; line-height: 1.5;">
//             Hi ${oldUser.fullname},<br><br>
//             You requested to reset your password.<br>
//             Please click the link below to reset your password:
//         </p>
//         <a href="${link}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 16px; text-decoration: none; color: #fff; background-color: #007bff; border-radius: 5px;">Reset Password</a>
//     </div>
// </div>
//     `
//     await mailSender(res, oldUser.email, 'Reset Password', body);

// });

// const getResetPasswordForm = asyncHandler(async (req, res) => {
//     const { id, token } = req.params;
//     const oldUser = await User.findOne({ _id: id });
//     if (!oldUser) {
//         res.status(404);
//         throw new Error('User Not Found');
//     }
//     const secret = process.env.SECRET_KEY + oldUser.password;
//     try {
//         const verify = jwt.verify(token, secret);
//         res.render("index", { email: verify.email, status: "Not Verified", error: '' });
//     } catch (error) {
//         res.status(400).send("Not Verified");
//     }
// })

// const postResetPasswordForm = asyncHandler(async (req, res) => {
//     const { id, token } = req.params;
//     const { password, confirmpassword } = req.body;
//     let validationError = '';
//     if (!password || !confirmpassword) {
//         validationError = 'both field are required';
//     }
//     if (password.length < 4) {
//         validationError = 'Password must be at least 4 character long';
//     }
//     if (password !== confirmpassword) {
//         validationError = 'Password and confirm password must be same';
//     }

//     try {
//         const oldUser = await User.findOne({ _id: id });
//         if (!oldUser) {
//             res.status(404);
//             throw new Error('User Not Found');
//         }
//         const secret = process.env.SECRET_KEY + oldUser.password;
//         const verify = jwt.verify(token, secret);
//         if (validationError) {
//             res.render("index", { email: verify.email, status: "verified", error: validationError });
//         } else {
//             const encryptedPassword = await bcrypt.hash(password, 10);
//             await User.updateOne(
//                 {
//                     _id: id,
//                 },
//                 {
//                     $set: {
//                         password: encryptedPassword,
//                     },
//                 }
//             );

//             res.render("index", { email: verify.email, status: "verified", error: '' });
//         }

//     } catch (error) {
//         res.status(400);
//         throw new Error(error.message ? error.message : "Something Went Wrong");
//     }

// });

// const addOrUpdateUserImage = asyncHandler(async (req, res) => {
//     if (req.file) {
//         const user = await User.findOne({ _id: req.user.id });
//         if (!user) {
//             res.status(400);
//             throw new Error('User Not Found');
//         }
//         if (!user.image) {
//             const response = await User.findByIdAndUpdate(req.user.id, {
//                 image: req.file.filename
//             }, { new: true });
//             res.status(200).json({ message: "image added successfully" });
//         }
//         else {
//             const userResponse = await User.findByIdAndUpdate(req.user.id, {
//                 image: req.file.filename
//             }, { new: true });
//             const filePath = `./public/Images/${user.image}`;
//             try {

//                 await fs.promises.access(filePath);
//                 await fs.promises.unlink(filePath);
//             }
//             catch (error) {
//                 console.error('File deletion error:', error);
//             }

//             res.status(200).json({ message: "image updated successfully" });
//         }

//     } else {
//         res.status(400);
//         throw new Error('file is not uploaded');
//     }

// })
// module.exports = {
//     registerUser,
//     getUsers,
//     getCurrentUser,
//     getUserById,
//     loginUser,
//     deleteUser,
//     updateUser,
//     updateUserPassword,
//     sendForgetPasswordLink,
//     getResetPasswordForm,
//     getResetPasswordForm,
//     postResetPasswordForm,
//     addOrUpdateUserImage,
//     deleteUserByAdmin,
//     updateUserByAdmin
// }