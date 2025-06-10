const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Modifier un produit
const modifier = async (req, res) => {

  try {
    const { uuid } = req.params;
    const { nom, description, prix, stock, photo_url } = req.body;

    const produitExistant = await prisma.produit.findUnique({
      where: { id: uuid }
    });

    if (!produitExistant) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    const dataToUpdate = {};
    if (nom !== undefined && nom !== '') dataToUpdate.nom = nom;
    if (description !== undefined) dataToUpdate.description = description;
    if (prix !== undefined && prix !== '') {
      const prixParsed = parseFloat(prix);
      if (!isNaN(prixParsed)) dataToUpdate.prix = prixParsed;
    }
    if (stock !== undefined && stock !== '') {
      const stockParsed = parseInt(stock);
      if (!isNaN(stockParsed)) dataToUpdate.stock = stockParsed;
    }
    if (photo_url !== undefined && photo_url !== '') dataToUpdate.photo_url = photo_url;

    const produitMisAJour = await prisma.produit.update({
      where: { id: uuid },
      data: dataToUpdate
    });

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: produitMisAJour
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
