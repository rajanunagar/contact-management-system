const express = require("express");
const {
  registerUser,
  currentUser,
  loginUser,
  getAllUserr
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);
router.put("/:id", (req,res)=>{
  console.log(req.params.id);
  res.send('hello');
});
router.post("/current", validateToken, currentUser);

router.get("/",getAllUserr);

module.exports = router;
