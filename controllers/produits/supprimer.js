const produitService = require('../../services/produits');
const rabbitmq = require('../../services/rabbitmqService');

const supprimer = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    await produitService.deleteProduit(uuid);

    await rabbitmq.publishProductDeleted(uuid);

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = supprimer;