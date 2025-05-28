const supprimer = require('../../controllers/produits/supprimer');
const { PrismaClient } = require('@prisma/client');

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    produit: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('supprimer Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('Cas de succès', () => {
    it('supprime un produit existant', async () => {
      const uuid = "abc123";
      const produitMock = { id: uuid, nom: 'Test' };

      req.params = { uuid };

      prisma.produit.findUnique.mockResolvedValue(produitMock);
      prisma.produit.delete.mockResolvedValue(produitMock);

      await supprimer(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: uuid } });
      expect(prisma.produit.delete).toHaveBeenCalledWith({ where: { id: uuid } });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produit supprimé avec succès'
      });
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Produit non trouvé', () => {
    it('retourne 404 si le produit est absent', async () => {
      const uuid = "inexistant123";
      req.params = { uuid };

      prisma.produit.findUnique.mockResolvedValue(null);

      await supprimer(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: uuid } });
      expect(prisma.produit.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Produit non trouvé'
      });
    });
  });

  describe('Erreurs serveur', () => {
    it('gère les erreurs lors du findUnique', async () => {
      const uuid = "error123";
      const mockError = new Error("Erreur DB");

      req.params = { uuid };
      prisma.produit.findUnique.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await supprimer(req, res);

      expect(consoleSpy).toHaveBeenCalledWith("Erreur:", mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleSpy.mockRestore();
    });

    it('gère les erreurs lors du delete', async () => {
      const uuid = "error-delete";
      const produitMock = { id: uuid };
      const mockError = new Error("Erreur suppression");

      req.params = { uuid };

      prisma.produit.findUnique.mockResolvedValue(produitMock);
      prisma.produit.delete.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await supprimer(req, res);

      expect(consoleSpy).toHaveBeenCalledWith("Erreur:", mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Vérifications diverses', () => {
    it('ne fait rien si uuid est manquant', async () => {
      req.params = {}; // uuid manquant

      await supprimer(req, res);

      // Erreur probable avec `undefined`, doit être gérée
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: undefined } });
    });
  });
});
