const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Ajouter un produit
const ajouter = async (req, res) => {

  try {
    const { nom, description, prix, stock, photo_url } = req.body;

    if (!nom || prix === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le prix sont requis'
      });
    }

    const nouveauProduit = await prisma.produit.create({
      data: {
        nom,
        description: description || null,
        prix: parseFloat(prix),
        stock: parseInt(stock) || 0,
        photo_url: photo_url || null
      }
    });

    res.status(201).json({
      success: true,
      data: nouveauProduit,
      message: 'Produit créé avec succès'
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = ajouter;