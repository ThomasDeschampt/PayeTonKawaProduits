const produitService = require('../../services/produits');

const afficher = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    const produit = await produitService.getProduit(uuid);

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: produit
    });
  } catch (error) {
    next(error);
  }
};

module.exports = afficher;