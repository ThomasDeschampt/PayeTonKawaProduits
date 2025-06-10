const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
    app: 'api-produits',
    prefix: 'api_produits_',
    timeout: 10000,
    register
});

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new client.Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);

const metricsMiddleware = async (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const route = req.route ? req.route.path : req.path;
        
        httpRequestDurationMicroseconds
            .labels(req.method, route, res.statusCode.toString())
            .observe(duration / 1000);
            
        httpRequestsTotal
            .labels(req.method, route, res.statusCode.toString())
            .inc();
    });
    
    next();
};

const metricsRoute = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

module.exports = {
    metricsMiddleware,
    metricsRoute,
    register,
    httpRequestDurationMicroseconds,
    httpRequestsTotal,
    activeConnections
}; 