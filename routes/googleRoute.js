const express = require("express");
const { verifyToken } = require("../middlewares/googleMiddleware");
const {
  protectedRoute,
  setPin,
  verifyPin,
  logout,
} = require("../controllers/googleController");

const router = express.Router();

router.post("/protected", verifyToken, protectedRoute);
router.post("/set-pin", verifyToken, setPin);
router.post("/verify-pin", verifyToken, verifyPin);
router.post("/logout", verifyToken, logout);

module.exports = router;
