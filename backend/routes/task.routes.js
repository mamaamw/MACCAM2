import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Placeholder routes pour les tâches
router.get('/', (req, res) => res.json({ success: true, data: [] }));
router.get('/:id', (req, res) => res.json({ success: true, data: {} }));
router.post('/', (req, res) => res.json({ success: true, data: {} }));
router.put('/:id', (req, res) => res.json({ success: true, data: {} }));
router.delete('/:id', (req, res) => res.json({ success: true }));

export default router;
