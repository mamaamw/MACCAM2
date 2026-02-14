import express from 'express';
import { body } from 'express-validator';
import { getLeads, getLead, createLead, updateLead, deleteLead } from '../controllers/lead.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = express.Router();

const leadValidation = [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('companyName').notEmpty().withMessage('Le nom de l\'entreprise est requis'),
  body('contactName').notEmpty().withMessage('Le nom du contact est requis'),
  body('email').isEmail().withMessage('Email invalide')
];

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(leadValidation, validateRequest, createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(authorize('ADMIN', 'MANAGER'), deleteLead);

export default router;
