import dotenv from 'dotenv';
import app from './app.js';

// Charger les variables d'environnement
dotenv.config();

const PORT = process.env.PORT || 5000;

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

// Gestion des erreurs de processus
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Arrêt du serveur...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu. Arrêt gracieux...');
  server.close(() => {
    console.log('💥 Processus terminé!');
  });
});
