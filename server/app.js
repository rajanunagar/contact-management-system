const express = require('express');
const connectDb = require('./config/connectionDB');
const app = express();
require('dotenv').config();
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const PORT = process.env.PORT;
const cors = require('cors');
const validateToken = require('./middlewares/validateToken');
const logger = require('./middlewares/logger');



connectDb();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json())
app.use(express.static('public'));
app.use(logger);

app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/otp', require('./routes/otpRoutes'));
app.use('/api/validatetoken', validateToken, (req, res) => { res.status(200).json({ message: 'token varified' }) });
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
})
app.use(globalErrorHandler);


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})





/*

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
})

app.post('/api/upload', upload.single('file'), asyncHandler(async (req, res) => {
    console.log(req.body, 'shfsk');
    // console.log(req.file.filename);
    if (req.file) {
        // const response = await Image.create({ image: req.file.filename });
        res.status(200).json('success');
    } else {
        res.status(400);
        throw new Error('file is not uploaded');
    }
}));

app.get('/api/upload', async (req, res) => {

    const response = await Image.find();
    res.status(200).json(response);
})
app.delete('/api/upload/:id', asyncHandler(async (req, res) => {

    const img = await Image.findById(req.params.id);
    console.log(req.params.id, img);
    if (!img) {
        res.status(400);
        throw new Error('img not found');
    }
    const response = await Image.deleteOne({ _id: req.params.id });
    console.log(response);
    fs.unlinkSync(`./public/Images/${img.image}`);
    res.status(200).json(response);

}));

*/

//mongodb+srv://admin:admin@rajancluster.ja5qcgh.mongodb.net/CMS?retryWrites=true&w=majority