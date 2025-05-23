const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Modifier un produit par id
const modifier = async (req, res) => {
    console.log("Modifier un produit ", req);

  try {
    const { id } = req.params;
    const { nom, description, prix, stock } = req.body;

    const produitExistant = await prisma.produit.findUnique({
      where: { id: parseInt(id) }
    });

    if (!produitExistant) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    const dataToUpdate = {};
    if (nom !== undefined) dataToUpdate.nom = nom;
    if (description !== undefined) dataToUpdate.description = description;
    if (prix !== undefined) dataToUpdate.prix = parseFloat(prix);
    if (stock !== undefined) dataToUpdate.stock = parseInt(stock);

    const produitMisAJour = await prisma.produit.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    res.json({
      success: true,
      data: produitMisAJour,
      message: 'Produit mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = modifier;