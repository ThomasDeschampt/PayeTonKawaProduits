const produitService = require('../../services/produits');

const supprimer = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    await produitService.deleteProduit(uuid);
    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = supprimer;