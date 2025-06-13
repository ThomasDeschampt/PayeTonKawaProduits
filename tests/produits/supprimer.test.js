const supprimer = require('../../controllers/produits/supprimer');

// Mock des services
jest.mock('../../services/produits', () => ({
  deleteProduit: jest.fn(),
}));
jest.mock('../../services/rabbitmqService', () => ({
  publishProductDeleted: jest.fn(),
}));

const produitService = require('../../services/produits');
const rabbitmq = require('../../services/rabbitmqService');

describe('supprimer Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('Cas de succès', () => {
    it('supprime un produit existant', async () => {
      const uuid = "abc123";
      req.params = { uuid };

      produitService.deleteProduit.mockResolvedValue();
      rabbitmq.publishProductDeleted.mockResolvedValue();

      await supprimer(req, res, next);

      expect(produitService.deleteProduit).toHaveBeenCalledWith(uuid);
      expect(rabbitmq.publishProductDeleted).toHaveBeenCalledWith(uuid);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produit supprimé avec succès'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Erreur lors de la suppression', () => {
    it('appelle next avec une erreur si deleteProduit échoue', async () => {
      const uuid = "abc123";
      const error = new Error("Erreur suppression");

      req.params = { uuid };
      produitService.deleteProduit.mockRejectedValue(error);

      await supprimer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('UUID manquant', () => {
    it('appelle next avec une erreur si uuid est manquant', async () => {
      req.params = {};

      await supprimer(req, res, next);

      expect(produitService.deleteProduit).toHaveBeenCalledWith(undefined);
    });
  });
});
