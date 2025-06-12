const { 
  httpRequestsTotal, 
  httpRequestDuration, 
  httpRequestExceptions,
  register 
} = require('../metrics');
const logger = require('../utils/logger');

// Middleware pour capturer les métriques HTTP + logs
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route: route,
      status_code: res.statusCode
    }, duration / 1000);

    if (!req.path.includes('/metrics') && !req.path.includes('/health')) {
      logger.logApiCall(req, res, duration);
    }
  });
  
  next();
};

// Middleware pour capturer les exceptions
const errorMetricsMiddleware = (err, req, res, next) => {
  const route = req.route ? req.route.path : req.path;
  
  httpRequestExceptions.inc({
    method: req.method,
    route: route,
    exception_type: err.name || 'UnknownError'
  });

  const duration = Date.now() - (req.startTime || Date.now());
  logger.logApiCall(req, res, duration, err);
  
  next(err);
};

const metricsRoute = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

module.exports = {
  metricsMiddleware,
  errorMetricsMiddleware,
  metricsRoute
};