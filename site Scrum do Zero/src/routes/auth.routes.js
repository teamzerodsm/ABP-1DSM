const { Router } = require("express");
const {
	loginController,
	logoutController,
	forgotPasswordController,
	verifyCodeController,
	resetPasswordController,
} = require("../controllers/auth.controller");

const router = Router();
router.post("/login", loginController);
router.post("/logout", logoutController);
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-code", verifyCodeController);
router.post("/reset-password", resetPasswordController);

module.exports = router;