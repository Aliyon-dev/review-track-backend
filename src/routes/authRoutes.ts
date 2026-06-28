import { Router } from 'express';

import { protect } from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validateMiddleware';
import { loginValidators } from '@/validators/authValidators';
import { login, getMeController, logoutController } from '@/controllers/authController';

const router = Router();

router.post('/login', loginValidators, validate, login);
router.get('/me', protect, getMeController);
router.post('/logout', protect, logoutController);

export default router;
