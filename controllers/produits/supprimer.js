const produitService = require('../../services/produits');

const supprimer = async (req, res) => {
  try {
    const { uuid } = req.params;
    const produit = await produitService.deleteProduit(uuid);

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = supprimer;