export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log l'erreur pour le développeur
  console.error(err);

  // Erreur Prisma - Violation de contrainte unique
  if (err.code === 'P2002') {
    const message = 'Cet enregistrement existe déjà';
    error = { statusCode: 400, message };
  }

  // Erreur Prisma - Enregistrement non trouvé
  if (err.code === 'P2025') {
    const message = 'Enregistrement non trouvé';
    error = { statusCode: 404, message };
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = { statusCode: 401, message };
  }

  // Erreur JWT expirée
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = { statusCode: 401, message };
  }

  // Erreur de validation
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { statusCode: 400, message };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
