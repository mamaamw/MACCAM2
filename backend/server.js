import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { initializeSocket } from './utils/socket.js';

// Charger les variables d'environnement
dotenv.config();

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);
initializeSocket(httpServer);

// Démarrer le serveur
const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('🔌 WebSocket Socket.IO activé');
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
