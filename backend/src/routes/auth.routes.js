import { Router } from 'express';
import { register, login, logout, getMe, forgotPasswordHandler, resetPasswordHandler } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register',        registerValidator, register);
router.post('/login',           loginValidator,    login);
router.post('/logout',                             logout);
router.get('/me',               protect,           getMe);
router.post('/forgot-password',                    forgotPasswordHandler);
router.post('/reset-password',                     resetPasswordHandler);

export default router;
