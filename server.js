import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './server/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('❌ CRITICAL ERROR: JWT_SECRET environment variable is not defined!');
}

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to Database
connectDB();

// Middleware
app.set('trust proxy', 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Cấu hình CORS
const allowedOrigins = [
  'https://quantritailieu.com.vn',
  'https://www.quantritailieu.com.vn',
  'http://localhost:5173',
  'https://quantritailieu-app-283729288330.asia-southeast1.run.app'
];

import documentRoutes from './server/routes/document.routes.js';
import documentSetRoutes from './server/routes/documentSet.routes.js';
import customerRoutes from './server/routes/customer.routes.js';
import savedDocumentRoutes from './server/routes/savedDocument.routes.js';
import aiRoutes from './server/routes/ai.routes.js';
import authRoutes from './server/routes/auth.routes.js';
import userRoutes from './server/routes/user.routes.js';
import auditRoutes from './server/routes/audit.routes.js';
import searchRoutes from './server/routes/search.routes.js';
import { authenticateJWT } from './server/middlewares/auth.js';

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    
    const isLocalIP = origin.startsWith('http://192.168.') || 
                      origin.startsWith('http://10.') || 
                      origin.startsWith('http://172.');
                      
    const isLocalhost = origin.startsWith('http://localhost:') || 
                        origin.startsWith('https://localhost:') ||
                        origin === 'http://localhost' ||
                        origin === 'https://localhost' ||
                        origin.startsWith('http://127.0.0.1:') ||
                        origin.startsWith('https://127.0.0.1:') ||
                        origin === 'http://127.0.0.1' ||
                        origin === 'https://127.0.0.1';
                      
    if (isLocalIP || isLocalhost) {
      return callback(null, true);
    }

    console.warn(`❌ [CORS Blocked] Origin: ${origin}`);
    callback(new Error('CORS Policy: Not allowed'));
  },
  credentials: true
}));

// API Routes
app.use('/api/auth', authRoutes); // Internally secures /me and /change-password
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/audit-logs', authenticateJWT, auditRoutes);
app.use('/api/documents', authenticateJWT, documentRoutes);
app.use('/api/document-sets', authenticateJWT, documentSetRoutes);
app.use('/api/customers', authenticateJWT, customerRoutes);
app.use('/api/saved-documents', authenticateJWT, savedDocumentRoutes);
app.use('/api/ai', authenticateJWT, aiRoutes);
app.use('/api/search', authenticateJWT, searchRoutes);


app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Backend is running correctly for quantritailieu.com.vn!' });
});

// Phục vụ giao diện Frontend (Static Files)
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  console.log("✅ [Static] Serving React App from ./dist");
  app.use(express.static(distPath));
  
  // Catch-All cho React Router (Fix cho Express v5)
  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: `API Route Not Found: ${req.method} ${req.path}` });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
