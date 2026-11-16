import { Router } from 'express';
import {
  buildNFA,
  buildDFA,
  minimizeAutomata,
  simulateAutomata
} from '../controllers/automataController.js';

const router = Router();

router.post('/nfa', buildNFA);
router.post('/dfa', buildDFA);
router.post('/minimize', minimizeAutomata);
router.post('/simulate', simulateAutomata);

export default router;
