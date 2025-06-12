const winston = require('winston');
const path = require('path');

// Configuration des formats
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Configuration du logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'api-produits' },
  transports: [
    // Logs d'erreurs uniquement
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Tous les logs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Logs spécifiques aux APIs
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/api-calls.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
});

// En développement, afficher aussi dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Fonction helper pour logger les appels API
logger.logApiCall = (req, res, duration, error = null) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    route: req.route ? req.route.path : req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    query: req.query,
    body: req.method === 'POST' ? req.body : undefined,
  };

  if (error) {
    logData.error = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
    logger.error('API Call Failed', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('API Call Warning', logData);
  } else {
    logger.info('API Call Success', logData);
  }
};

// Fonction helper pour logger les messages RabbitMQ
logger.logRabbitMQ = (action, queue, message, error = null) => {
  const logData = {
    timestamp: new Date().toISOString(),
    action: action, // 'send' ou 'receive'
    queue: queue,
    messageId: message.id || 'unknown',
    messageType: message.type || 'unknown',
  };

  if (error) {
    logData.error = {
      message: error.message,
      stack: error.stack
    };
    logger.error(`RabbitMQ ${action} failed`, logData);
  } else {
    logger.info(`RabbitMQ ${action} success`, logData);
  }
};

module.exports = logger;