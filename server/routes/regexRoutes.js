import { Router } from 'express';
import { testRegex } from '../controllers/regexController.js';

const router = Router();

router.post('/test', testRegex);

export default router;
