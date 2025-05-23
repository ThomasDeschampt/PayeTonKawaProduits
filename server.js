const express = require('express');
const cors = require('cors');
const setupSwagger = require('./swagger');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api`);

  const jwt = require('jsonwebtoken');

  //temporaire
  const token = jwt.sign(
    { username: 'testuser' }, // payload
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log(token);


});

process.on('SIGINT', async () => {
  console.log('Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

