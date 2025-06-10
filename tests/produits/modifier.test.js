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

      await modifier(req, res, next);

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

      prisma.produit.findUnique.mockResolvedValue(null);

      await modifier(req, res, next);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: uuid } });
      expect(prisma.produit.update).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('Erreurs serveur', () => {
    it('gère les erreurs lors de findUnique', async () => {
      const uuid = "error-find";
      const mockError = new Error("Erreur DB");

      req.params = { uuid };
      prisma.produit.findUnique.mockRejectedValue(mockError);

      await modifier(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('gère les erreurs lors de update', async () => {
      const uuid = "error-update";
      const produitExistant = { id: uuid };
      const mockError = new Error("Erreur update");

      req.params = { uuid };
      req.body = { nom: "Test" };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockRejectedValue(mockError);

      await modifier(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
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

      await modifier(req, res, next);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: uuid },
        data: {
          nom: "Validé"
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('ne fait rien si aucun champ n’est fourni', async () => {
      const uuid = "no-update";
      const produitExistant = { id: uuid };
      const produitModifie = { id: uuid };

      req.params = { uuid };
      req.body = {}; 

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitModifie);

      await modifier(req, res, next);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: uuid },
        data: {}
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('UUID manquant', () => {
    it('gère l’absence de paramètre uuid', async () => {
      req.params = {}; // uuid absent

      await modifier(req, res, next);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({ where: { id: undefined } });
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
