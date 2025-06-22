const express = require('express');
const authController = require('../controllers/authController'); 
const { identifier } = require('../middlewares/identification');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/admin-login', authController.adminLogin);
router.post('/login', authController.customerLogin);
//router.post('/signout', identifier, authController.customerSignout);

router.patch('/send-verification-code', authController.sendVerificationCode);
router.patch('/verify-verification-code', authController.verifyVerificationCode);
//router.patch('/change-password', authController.changePassword);
router.patch('/send-forgot-password-code', authController.sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', authController.verifyForgotPasswordCode);

module.exports = router;