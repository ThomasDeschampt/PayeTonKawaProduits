const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const setupSwagger = require('./swagger');
const { PrismaClient } = require('@prisma/client');
const rabbitmq = require('./services/rabbitmq');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

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
app.use("/api/produits", require("./routes/produits"));

setupSwagger(app);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

async function initializeRabbitMQ() {
  try {
    await rabbitmq.connect();
    await rabbitmq.createQueue('produits');
    
    await rabbitmq.consumeMessages('produits', (message) => {
      console.log('Nouveau message reçu:', message);
    });
    
    console.log('RabbitMQ initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de RabbitMQ:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api`);
  console.log('Protection DDoS activée (100 req/15min par IP)');

  await initializeRabbitMQ();

  const jwt = require('jsonwebtoken');

  const token = jwt.sign(
    { username: 'testuser' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log(token);
});

process.on('SIGINT', async () => {
  console.log('Arrêt du serveur...');
  await prisma.$disconnect();
  await rabbitmq.close();
  process.exit(0);
});