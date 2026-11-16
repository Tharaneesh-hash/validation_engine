import { Router } from 'express';
import {
  getHistory,
  deleteHistoryItem,
  clearAllHistory
} from '../controllers/historyController.js';

const router = Router();

router.get('/', getHistory);
router.delete('/:id', deleteHistoryItem);
router.delete('/', clearAllHistory);

export default router;
