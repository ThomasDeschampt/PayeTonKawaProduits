const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const setupSwagger = require('./swagger');
const { PrismaClient } = require('@prisma/client');
const rabbitmq = require('./services/rabbitmq');
const jwt = require('jsonwebtoken');
const { metricsMiddleware, metricsRoute } = require('./middleware/metrics');
const errorHandler = require('./middleware/error.middleware');
const config = require('./config');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        message: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(metricsMiddleware);
app.use(limiter);
app.use(cors());
app.use(express.json());
app.use("/api/produits", require("./routes/produits"));

app.get('/metrics', metricsRoute);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

setupSwagger(app);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

app.use(errorHandler);

async function initializeRabbitMQ() {
    let retries = 0;
    const maxRetries = 3;
    const retryDelay = 5000;

    while (retries < maxRetries) {
        try {
            console.log(`Tentative d'initialisation de RabbitMQ (${retries + 1}/${maxRetries})...`);
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
            return;
        } catch (error) {
            retries++;
            console.error(`Échec de l'initialisation de RabbitMQ (tentative ${retries}/${maxRetries}):`, error.message);
            
            if (retries === maxRetries) {
                console.error('Impossible d\'initialiser RabbitMQ après plusieurs tentatives. Le service continuera sans RabbitMQ.');
                return;
            }
            
            console.log(`Nouvelle tentative dans ${retryDelay/1000} secondes...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

const server = app.listen(config.server.port, async () => {
    console.log(`Serveur démarré sur le port ${config.server.port}`);
    console.log(`API disponible sur http://localhost:${config.server.port}/api`);
    console.log('Protection DDoS activée (100 req/15min par IP)');
    console.log('Métriques Prometheus disponibles sur /metrics');

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