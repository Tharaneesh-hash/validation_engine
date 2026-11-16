import { Router } from 'express';
import { validateForm } from '../controllers/validationController.js';

const router = Router();

router.post('/', validateForm);

export default router;
