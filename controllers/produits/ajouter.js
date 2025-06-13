const produitService = require('../../services/produits');
const rabbitmq = require('../../services/rabbitmqService');

const ajouter = async (req, res, next) => {
  try {
    const nouveauProduit = await produitService.createProduit(req.body);
    
    await rabbitmq.publishProductCreated(nouveauProduit);

    res.status(201).json({
      success: true,
      data: nouveauProduit,
      message: 'Produit créé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = ajouter;