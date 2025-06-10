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
      const produitMock = { id: uuid, nom: 'Test' };

      req.params = { uuid };

      prisma.produit.findUnique.mockResolvedValue(produitMock);
      prisma.produit.delete.mockResolvedValue(produitMock);

      await supprimer(req, res, next);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: uuid } });
      expect(prisma.produit.delete).toHaveBeenCalledWith({ where: { id: uuid } });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produit supprimé avec succès'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Produit non trouvé', () => {
    it('retourne 404 si le produit est absent', async () => {
      const uuid = "inexistant123";
      req.params = { uuid };

      prisma.produit.findUnique.mockResolvedValue(null);

      await supprimer(req, res, next);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: uuid } });
      expect(prisma.produit.delete).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('Erreurs serveur', () => {
    it('gère les erreurs lors du findUnique', async () => {
      const uuid = "error123";
      const mockError = new Error("Erreur DB");

      req.params = { uuid };
      prisma.produit.findUnique.mockRejectedValue(mockError);

      await supprimer(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('gère les erreurs lors du delete', async () => {
      const uuid = "error-delete";
      const produitMock = { id: uuid };
      const mockError = new Error("Erreur suppression");

      req.params = { uuid };

      prisma.produit.findUnique.mockResolvedValue(produitMock);
      prisma.produit.delete.mockRejectedValue(mockError);

      await supprimer(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('Vérifications diverses', () => {
    it('ne fait rien si uuid est manquant', async () => {
      req.params = {}; // uuid manquant

      await supprimer(req, res, next);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: undefined } });
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
