const promClient = require('prom-client');

// Métriques pour les exigences Payetonkawa
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestExceptions = new promClient.Counter({
  name: 'http_request_exceptions_total',
  help: 'Total number of HTTP request exceptions',
  labelNames: ['method', 'route', 'exception_type']
});

// Pour RabbitMQ (si tu utilises une queue)
const messagesSent = new promClient.Counter({
  name: 'rabbitmq_messages_sent_total',
  help: 'Total messages sent to queue',
  labelNames: ['queue']
});

const messagesReceived = new promClient.Counter({
  name: 'rabbitmq_messages_received_total',
  help: 'Total messages received from queue',
  labelNames: ['queue']
});

module.exports = {
  httpRequestsTotal,
  httpRequestDuration,
  httpRequestExceptions,
  messagesSent,
  messagesReceived,
  register: promClient.register
};