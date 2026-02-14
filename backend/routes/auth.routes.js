import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = express.Router();

// Validation pour l'inscription
const registerValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('firstName').notEmpty().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().withMessage('Le nom est requis')
];

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
];

// Routes publiques
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);

// Routes protégées
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/updatepassword', protect, [
  body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
  body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
], validateRequest, updatePassword);

export default router;
