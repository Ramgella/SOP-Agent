import express from 'express';
import { askQuestion } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/ask', askQuestion);

export default router;
