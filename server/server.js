import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import magicRoutes from './routes/magic.js';
import pokemonRoutes from './routes/pokemon.js';
import yugiohRoutes from './routes/yugioh.js';
import lorcanaRoutes from './routes/lorcana.js';
import onepieceRoutes from './routes/onepiece.js';
import fabRoutes from './routes/fab.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://full-foil-1-0.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/magic', magicRoutes);
app.use('/api/pokemon', pokemonRoutes);
app.use('/api/yugioh', yugiohRoutes);
app.use('/api/lorcana', lorcanaRoutes);
app.use('/api/onepiece', onepieceRoutes);
app.use('/api/fab', fabRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 FullFoil Backend Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
