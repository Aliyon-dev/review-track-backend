import { body } from 'express-validator';

export const commentValidators = [
  body('comment').trim().notEmpty().withMessage('Comment is required'),
];
