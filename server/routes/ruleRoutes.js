import { Router } from 'express';
import { getRules, createRule } from '../controllers/ruleController.js';

const router = Router();

router.get('/', getRules);
router.post('/', createRule);

export default router;
