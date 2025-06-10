const produitService = require('../../services/produits');

const afficherAll = async (req, res) => {
  try {
    const produits = await produitService.getAllProduits();

    res.status(200).json({
      success: true,
      data: produits
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