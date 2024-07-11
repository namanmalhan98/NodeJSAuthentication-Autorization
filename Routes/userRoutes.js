const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedInUser,
} = require("../controllers/userController");

router.post("/userForm", registerUser);
router.post("/login", loginUser);
router.get("/getUserLogin", getLoggedInUser);

module.exports = router;