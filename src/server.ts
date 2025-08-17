import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import crewRoutes from './routes/crew.routes.js';
import authRoutes from './routes/auth.routes.js';
import clubPresetsRoutes from './routes/clubPresets.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:3000', 
        'https://accounts.google.com',
        'https://toddms.github.io'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '10mb' }));

// Handle preflight requests
app.options('*', cors());

// Static file serving for saved images
app.use('/api/saved-images', (req, res, next) => {
  res.setHeader('Content-Disposition', 'inline');
  next();
}, express.static(path.join(process.cwd(), 'src', 'assets', 'saved-images')));

// Static file serving for club logos
app.use('/api/club-logos', (req, res, next) => {
  res.setHeader('Content-Disposition', 'inline');
  next();
}, express.static(path.join(process.cwd(), 'src', 'assets', 'club-logos')));

// Routes
app.use('/api/crews', crewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/club-presets', clubPresetsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});