require('dotenv').config();

module.exports = {
    server: {
        port: process.env.PORT || 3007,
        env: process.env.NODE_ENV || 'development'
    },
    database: {
        url: process.env.DATABASE_URL
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiration: process.env.JWT_EXPIRATION || '1h'
    },
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost',
        user: process.env.RABBITMQ_USER || 'guest',
        password: process.env.RABBITMQ_PASSWORD || 'guest'
    },
    prometheus: {
        port: process.env.PROMETHEUS_PORT || 9090
    },
    grafana: {
        port: process.env.GRAFANA_PORT || 3000
    },
    swagger: {
        title: process.env.SWAGGER_TITLE || 'PayeTonKawa API',
        description: process.env.SWAGGER_DESCRIPTION || 'API de gestion des produits pour PayeTonKawa',
        version: process.env.SWAGGER_VERSION || '1.0.0'
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    }
}; 