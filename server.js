const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const setupSwagger = require('./swagger');
const { PrismaClient } = require('@prisma/client');
const rabbitmq = require('./services/rabbitmq');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_super_securise_2024';
const JWT_EXPIRATION = '1h';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide ou expiré' });
        }
        req.user = user;
        next();
    });
};

app.post('/api/auth/token', (req, res) => {
    const token = jwt.sign({ 
        id: 1,
        timestamp: new Date().toISOString()
    }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    
    res.json({ token });
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.use("/api/produits", verifyToken, require("./routes/produits"));

setupSwagger(app);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

async function initializeRabbitMQ() {
    try {
        await rabbitmq.connect();
        
        await rabbitmq.listenToPort3002((message) => {
            console.log('Message reçu du port 3002:', message);
        });

        await rabbitmq.listenToPort3003((message) => {
            console.log('Message reçu du port 3003:', message);
        });

        await rabbitmq.listenToPort3004((message) => {
            console.log('Message reçu du port 3004:', message);
        });
        
        console.log('RabbitMQ initialisé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de RabbitMQ:', error);
    }
}

const server = app.listen(PORT, async () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`API disponible sur http://localhost:${PORT}/api`);
    console.log('Protection DDoS activée (100 req/15min par IP)');

    try {
        await initializeRabbitMQ();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
});

process.on('SIGTERM', async () => {
    console.log('Arrêt du serveur...');
    server.close(async () => {
        await prisma.$disconnect();
        await rabbitmq.close();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('Arrêt du serveur...');
    server.close(async () => {
        await prisma.$disconnect();
        await rabbitmq.close();
        process.exit(0);
    });
});