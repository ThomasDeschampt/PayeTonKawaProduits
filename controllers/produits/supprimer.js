const produitService = require('../../services/produits');
const rabbitmq = require('../../services/rabbitmqService');
const { messagesSent, messagesReceived } = require('../../metrics');

const supprimer = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    await produitService.deleteProduit(uuid);

    await rabbitmq.publishProductDeleted(uuid);
    messagesSent.inc({ queue: 'produit.deleted' });

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = supprimer;