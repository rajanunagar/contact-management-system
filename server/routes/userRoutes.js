const express = require('express');
const router = express.Router();
const { registerUser, getUsers, getCurrentUser, loginUser, getUserById, deleteUser, updateUser, updateUserPassword, sendForgetPasswordLink, getResetPasswordForm, postResetPasswordForm, addOrUpdateUserImage, deleteUserByAdmin, updateUserByAdmin, isUserIsAdmin } = require('../controllers/userController');
const validateToken = require('../middlewares/validateToken');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
})
const upload = multer({
    storage: storage
});

router.post('/register', upload.single('file'), registerUser);
router.post('/login', loginUser);
router.post("/forgot-password", sendForgetPasswordLink);
router.route('/reset-password/:id/:token').get(getResetPasswordForm).post(postResetPasswordForm);
router.use(validateToken);

router.route('/').get(isUserIsAdmin, getUsers).delete(deleteUser).put(updateUser);
router.get('/current', getCurrentUser);
router.route('/updatepassword').put(updateUserPassword);
router.route('/:id', isUserIsAdmin).get(getUserById).delete(deleteUserByAdmin).put(updateUserByAdmin);

router.post('/image', upload.single('file'), addOrUpdateUserImage);


module.exports = router;

//this will be called for all the route which has / user and when we will do next then matching routes will be called.
// router.all('*', (req, res, next) => {
//     console.log('user')
//     try {
//         // res.status(401);
//         // throw new Error('not authorized');
//         next();
//     }
//     catch (err) {
//         return next(err);
//     }
// })