const modifier = require('../../controllers/produits/modifier');
const produitService = require('../../services/produits');

jest.mock('../../services/produits', () => ({
  updateProduit: jest.fn()
}));

describe('modifier Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('Cas de succès', () => {
    it('modifie un produit existant avec des champs valides', async () => {
      const uuid = "abc123";
      const produitModifie = { id: uuid, nom: "Nouveau Nom" };

      req.params = { uuid };
      req.body = {
        nom: "Nouveau Nom",
        prix: "25.5",
        stock: "10",
        photo_url: 'http://example.com/photo.jpg'
      };

      produitService.updateProduit.mockResolvedValue(produitModifie);

      await modifier(req, res, next);

      expect(produitService.updateProduit).toHaveBeenCalledWith(uuid, req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produit modifié avec succès',
        data: produitModifie
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Produit non trouvé', () => {
    it('retourne 404 si le produit n\'existe pas', async () => {
      const uuid = "not-found-id";
      req.params = { uuid };

      produitService.updateProduit.mockResolvedValue(null);

      await modifier(req, res, next);

      expect(produitService.updateProduit).toHaveBeenCalledWith(uuid, req.body);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Produit non trouvé'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Erreurs serveur', () => {
    it('gère les erreurs lancées par updateProduit', async () => {
      const uuid = "error-case";
      const error = new Error("Erreur serveur");
      req.params = { uuid };
      req.body = { nom: "Erreur" };

      produitService.updateProduit.mockRejectedValue(error);

      await modifier(req, res, next);

      expect(produitService.updateProduit).toHaveBeenCalledWith(uuid, req.body);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('UUID manquant', () => {
    it('gère l’absence de paramètre uuid', async () => {
      req.params = {}; // uuid manquant
      const error = new Error("UUID manquant");

      produitService.updateProduit.mockRejectedValue(error);

      await modifier(req, res, next);

      expect(produitService.updateProduit).toHaveBeenCalledWith(undefined, req.body);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
