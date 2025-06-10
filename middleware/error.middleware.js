const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error('Erreur:', err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'Un conflit est survenu avec les données existantes'
        });
    }

    if (err.name === 'NotFoundError') {
        return res.status(404).json({
            success: false,
            message: err.message || 'Ressource non trouvée'
        });
    }

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur'
    });
};

module.exports = errorHandler; 