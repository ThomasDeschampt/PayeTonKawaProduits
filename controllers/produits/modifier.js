const produitService = require('../../services/produits');
const rabbitmq = require('../../services/rabbitmqService');

const modifier = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    const produit = await produitService.updateProduit(uuid, req.body);

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    await rabbitmq.publishProductUpdated(produit);

    res.status(200).json({
      success: true,
      data: produit,
      message: 'Produit modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = modifier;
