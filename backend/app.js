import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import contactRoutes from './routes/contact.routes.js';
import contactFieldsRoutes from './routes/contact-fields.routes.js';
import customerRoutes from './routes/customer.routes.js';
import leadRoutes from './routes/lead.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import chatRoutes from './routes/chat.routes.js';
import storageRoutes from './routes/storage.js';
import calendarRoutes from './routes/calendar.js';
import notionPageRoutes from './routes/notion-page.routes.js';
import qrMediaRoutes from './routes/qr-media.routes.js';
import qrSettingsRoutes from './routes/qr-settings.routes.js';
import qrCodeRoutes from './routes/qr-code.routes.js';
import pdfMergeProjectRoutes from './routes/pdf-merge-project.routes.js';
import convertToPdfRoutes from './routes/convert-to-pdf.routes.js';
import pdfSignRoutes from './routes/pdf-sign.routes.js';
import cvRoutes from './routes/cv.routes.js';

// Middleware d'erreur
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Middleware de sécurité
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting (100 requêtes par 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  }
}));

// Routes API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/contact-fields', contactFieldsRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/storage', storageRoutes);
app.use('/api/v1/calendar', calendarRoutes);
app.use('/api/v1/notion-pages', notionPageRoutes);
app.use('/api/v1/qr-media', qrMediaRoutes);
app.use('/api/v1/qr-settings', qrSettingsRoutes);
app.use('/api/v1/qr-codes', qrCodeRoutes);
app.use('/api/v1/pdf-merge-projects', pdfMergeProjectRoutes);
app.use('/api/v1/convert-to-pdf', convertToPdfRoutes);
app.use('/api/v1/pdf-sign', pdfSignRoutes);
app.use('/api/v1/cv', cvRoutes);

// Route de test
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API fonctionne correctement ✅',
    timestamp: new Date().toISOString()
  });
});

// Route 404
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`
  });
});

// Middleware d'erreur global
app.use(errorHandler);

export default app;
