import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Générer un JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { email, username, password, firstName, lastName, phone } = req.body;

    // Vérifier si l'email existe déjà
    const emailExists = await prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Vérifier si le username existe déjà
    const usernameExists = await prisma.user.findUnique({ where: { username } });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: 'Ce nom d\'utilisateur est déjà pris'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur (automatiquement un contact aussi)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        isContact: true,  // Tous les utilisateurs sont aussi des contacts
        isActive: true    // Actifs par défaut lors de l'inscription
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // Générer le token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion utilisateur
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Vérifier si email et password sont fournis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un identifiant et un mot de passe'
      });
    }

    // Récupérer l'utilisateur par email ou username
    // SQLite: la recherche est case-insensitive par défaut pour LIKE
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Générer le token
    const token = generateToken(user.id);

    // Retirer le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/v1/auth/updateprofile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        phone,
        avatar
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true
      }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Récupérer l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    // Générer un nouveau token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
      data: { token }
    });
  } catch (error) {
    next(error);
  }
};
