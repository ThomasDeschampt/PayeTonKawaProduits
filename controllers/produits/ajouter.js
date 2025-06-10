const produitService = require('../../services/produits');

const ajouter = async (req, res) => {
  try {
    const nouveauProduit = await produitService.createProduit(req.body);

    res.status(201).json({
      success: true,
      data: nouveauProduit,
      message: 'Produit créé avec succès'
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(error.message === 'Le nom et le prix sont requis' ? 400 : 500).json({
      success: false,
      message: error.message || 'Erreur serveur'
    });
  }
};

module.exports = ajouter;