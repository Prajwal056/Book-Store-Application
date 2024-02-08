
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { loginSchema, registerSchema } = require('../schemas/user.schemas');
const { validatePayload, verifyToken } = require('../middlewares/payloadValidator');

// Route for user registration
router.post('/register', validatePayload(registerSchema), userController.registerUser);
router.post('/login', validatePayload(loginSchema), userController.loginUser);
router.get('/profile', verifyToken, userController.getUserProfile);
router.put('/profile', verifyToken, userController.updateUserProfile);

module.exports = router;


