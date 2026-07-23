import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { registerUserSchema, loginUserSchema } from '../validators/userValidator.js';

const router = express.Router();

router.post('/', validateRequest(registerUserSchema), registerUser);
router.post('/login', validateRequest(loginUserSchema), loginUser);

export default router;