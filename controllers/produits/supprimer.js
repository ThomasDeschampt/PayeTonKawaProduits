const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Supprimer un produit
const supprimer = async (req, res) => {

  try {
    const { uuid } = req.params;

    const produitExistant = await prisma.produit.findUnique({
      where: { id: uuid}
    });

    if (!produitExistant) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    await prisma.produit.delete({
      where: {id: uuid}
    });

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = supprimer;