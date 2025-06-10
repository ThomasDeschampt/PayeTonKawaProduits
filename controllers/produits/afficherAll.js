const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher tout les produits
const afficherAll = async (req, res) => {


  try {
    const produits = await prisma.produit.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json({
      success: true,
      data: produits,
      count: produits.length
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = afficherAll;