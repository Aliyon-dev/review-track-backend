import { Router } from 'express';

import { validate } from '@/middleware/validateMiddleware';
import { loginValidators } from '@/validators/authValidators';
import { login } from '@/controllers/authController';

const router = Router();

router.post('/login', loginValidators, validate, login);

export default router;
