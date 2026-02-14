import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Placeholder routes pour les projets
router.get('/', (req, res) => res.json({ success: true, data: [] }));
router.get('/:id', (req, res) => res.json({ success: true, data: {} }));
router.post('/', (req, res) => res.json({ success: true, data: {} }));
router.put('/:id', (req, res) => res.json({ success: true, data: {} }));
router.delete('/:id', authorize('ADMIN', 'MANAGER'), (req, res) => res.json({ success: true }));

export default router;
