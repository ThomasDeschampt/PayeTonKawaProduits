const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const setupSwagger = require('./swagger');
const { PrismaClient } = require('@prisma/client');
const { rabbitmq } = require('./services/rabbitmq');
const jwt = require('jsonwebtoken');
const { metricsMiddleware, errorMetricsMiddleware, metricsRoute } = require('./middleware/metrics');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');
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

app.use(errorMetricsMiddleware); 
app.use(errorHandler);



const server = app.listen(config.server.port, async () => {
    logger.info('Server started', {
        port: config.server.port,
        environment: process.env.NODE_ENV || 'development',
        features: ['DDoS Protection', 'Prometheus Metrics', 'Structured Logging']
    });
    
    // Logs au lieu de console.log
    logger.info('API endpoints available', {
        api: `http://localhost:${config.server.port}/api`,
        metrics: `http://localhost:${config.server.port}/metrics`,
        swagger: `http://localhost:${config.server.port}/api-docs`
    });
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