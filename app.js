const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const cors = require('cors');

connectDb();
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use(errorHandler);
// app.use("/api/test/:age",(req,res)=>{
//   console.log(req.query,req.params.id);
//   res.status(200).json('hello');
// })
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//CONNECTION_STRING=mongodb+srv://admin:admin@rajancluster.ja5qcgh.mongodb.net/contact?retryWrites=true&w=majority
