import { Router } from 'express';
import { login, logout, me, register } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { loginValidation, registerValidation } from '../validations/authValidation.js';

const router = Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
