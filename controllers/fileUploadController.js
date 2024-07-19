const asyncHandler = require("express-async-handler");
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });
  
  // Init upload
  const upload = multer({
    storage: storage,
  }).single('file');

const uploadFile = asyncHandler(async (req, res) => {
    upload(req, res, (err) => {
        // if (err) {
        //   res.status(500);
        // } else {
          const filePath = req.file.path;
          // Store filePath in your database if needed
        //   console.log(req.file,filePath); 
          res.status(200).json({ filePath: filePath });
        }
    //   }
    );
});

module.exports={
    uploadFile
}