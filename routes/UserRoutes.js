const express = require("express");
const Usercontroller = require("../controllers/userController");
const { changeUserPassword } = require("../controllers/userController");
const router = express.Router();
const userController = require("../controllers/userController");
const checkUserAuth = require("../middlewares/auth-middleware");

//  Route Level MiddlWare
router.use("/changepassword", checkUserAuth);
router.use("/logedUser", checkUserAuth);

// Public Routes
router.post("/register", userController.userRegistration);
router.post("/login", userController.userLogin);
router.post(
  "/send-reset-password-email",
  Usercontroller.sendUserPasswordResetEmail
);
router.post(
  "/reset-password/:id/:token",
  Usercontroller.userPasswordReset
);
// Private routes
router.post("/changepassword", userController.changeUserPassword);
router.get("/logedUser", userController.logedUser);
module.exports = router;
