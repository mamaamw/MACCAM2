import express from 'express';
import { body } from 'express-validator';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = express.Router();

// Validation
const customerValidation = [
  body('companyName').notEmpty().withMessage('Le nom de l\'entreprise est requis'),
  body('contactName').notEmpty().withMessage('Le nom du contact est requis'),
  body('email').isEmail().withMessage('Email invalide')
];

// Toutes les routes nécessitent une authentification
router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(customerValidation, validateRequest, createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(authorize('ADMIN', 'MANAGER'), deleteCustomer);

export default router;
