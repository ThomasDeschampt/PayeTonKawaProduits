const modifier = require('../../controllers/produits/modifier');
const { PrismaClient } = require('@prisma/client');

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    produit: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('modifier Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('Cas de succès', () => {
    it('modifie un produit existant avec des champs valides', async () => {
      const uuid = "abc123";
      const produitExistant = { id: uuid, nom: "Ancien Nom" };
      const produitModifie = { id: uuid, nom: "Nouveau Nom" };

      req.params = { uuid };
      req.body = {
        nom: "Nouveau Nom",
        prix: "25.5",
        stock: "10",
        photo_url: 'http://example.com/photo.jpg'
      };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitModifie);

      await modifier(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: uuid } });
      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: uuid },
        data: {
          nom: "Nouveau Nom",
          prix: 25.5,
          stock: 10,
          photo_url: 'http://example.com/photo.jpg'
        }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produit mis à jour avec succès',
        data: produitModifie
      });
    });
  });

  describe('Produit non trouvé', () => {
    it('retourne 404 si le produit n’existe pas', async () => {
      const uuid = "not-found-id";
      req.params = { uuid };

      prisma.produit.findUnique.mockResolvedValue(null);

      await modifier(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: uuid } });
      expect(prisma.produit.update).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Produit non trouvé'
      });
    });
  });

  describe('Erreurs serveur', () => {
    it('gère les erreurs lors de findUnique', async () => {
      const uuid = "error-find";
      const mockError = new Error("Erreur DB");

      req.params = { uuid };
      prisma.produit.findUnique.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await modifier(req, res);

      expect(consoleSpy).toHaveBeenCalledWith("Erreur:", mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleSpy.mockRestore();
    });

    it('gère les erreurs lors de update', async () => {
      const uuid = "error-update";
      const produitExistant = { id: uuid };
      const mockError = new Error("Erreur update");

      req.params = { uuid };
      req.body = { nom: "Test" };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await modifier(req, res);

      expect(consoleSpy).toHaveBeenCalledWith("Erreur:", mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Validation des champs', () => {
    it('ignore les champs invalides (prix et stock vides)', async () => {
      const uuid = "partial123";
      const produitExistant = { id: uuid };
      const produitModifie = { id: uuid, nom: "Validé" };

      req.params = { uuid };
      req.body = {
        nom: "Validé",
        prix: "",
        stock: ""
      };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitModifie);

      await modifier(req, res);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: uuid },
        data: {
          nom: "Validé"
        }
      });
    });

    it('ne fait rien si aucun champ n’est fourni', async () => {
      const uuid = "no-update";
      const produitExistant = { id: uuid };
      const produitModifie = { id: uuid };

      req.params = { uuid };
      req.body = {}; // Aucun champ

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitModifie);

      await modifier(req, res);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: uuid },
        data: {}
      });
    });
  });

  describe('UUID manquant', () => {
    it('gère l’absence de paramètre uuid', async () => {
      req.params = {}; // uuid absent

      await modifier(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: undefined } });
    });
  });
});
