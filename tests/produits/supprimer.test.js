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
    // Mock des objets req et res
    req = {
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Cas de succès', () => {
    it('devrait supprimer un produit existant avec succès', async () => {
      // Données mockées
      const mockProduitExistant = {
        id: 1,
        nom: 'Produit Test',
        prix: 25.99,
        created_at: new Date('2024-01-01')
      };

      // Configuration de la requête
      req.body = { id: 1 };

      // Configuration des mocks
      prisma.produit.findUnique.mockResolvedValue(mockProduitExistant);
      prisma.produit.delete.mockResolvedValue(mockProduitExistant);

      // Exécution de la fonction
      await supprimer(req, res);

      // Vérifications
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      expect(prisma.produit.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produit supprimé avec succès'
      });

      expect(res.status).not.toHaveBeenCalled();
    });

    it('devrait convertir l\'ID string en nombre et supprimer le produit', async () => {
      const mockProduitExistant = {
        id: 5,
        nom: 'Produit Test',
        prix: 15.50
      };

      // ID en string dans la requête
      req.body = { id: "5" };

      prisma.produit.findUnique.mockResolvedValue(mockProduitExistant);
      prisma.produit.delete.mockResolvedValue(mockProduitExistant);

      await supprimer(req, res);

      // Vérifications que parseInt a bien fonctionné
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: 5 }
      });

      expect(prisma.produit.delete).toHaveBeenCalledWith({
        where: { id: 5 }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Produit supprimé avec succès'
      });
    });
  });

  describe('Cas d\'erreur - Produit non trouvé', () => {
    it('devrait retourner une erreur 404 si le produit n\'existe pas', async () => {
      // Configuration de la requête
      req.body = { id: 999 };

      // Configuration du mock pour un produit non trouvé
      prisma.produit.findUnique.mockResolvedValue(null);

      // Exécution de la fonction
      await supprimer(req, res);

      // Vérifications
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });

      // delete ne devrait pas être appelé si le produit n'existe pas
      expect(prisma.produit.delete).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Produit non trouvé'
      });
    });

    it('devrait retourner une erreur 404 pour un ID inexistant (string)', async () => {
      req.body = { id: "999" };

      prisma.produit.findUnique.mockResolvedValue(null);

      await supprimer(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });

      expect(prisma.produit.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Cas d\'erreur - Erreurs de base de données', () => {
    it('devrait gérer les erreurs lors de la recherche du produit', async () => {
      const mockError = new Error('Erreur de connexion à la base de données');
      req.body = { id: 1 };

      // Configuration du mock pour simuler une erreur lors de findUnique
      prisma.produit.findUnique.mockRejectedValue(mockError);

      // Mock de console.error pour éviter l'affichage dans les tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Exécution de la fonction
      await supprimer(req, res);

      // Vérifications
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      expect(consoleSpy).toHaveBeenCalledWith('Erreur:', mockError);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      // delete ne devrait pas être appelé en cas d'erreur
      expect(prisma.produit.delete).not.toHaveBeenCalled();

      // Nettoyage du spy
      consoleSpy.mockRestore();
    });

    it('devrait gérer les erreurs lors de la suppression du produit', async () => {
      const mockProduitExistant = {
        id: 1,
        nom: 'Produit Test',
        prix: 25.99
      };
      const mockError = new Error('Erreur lors de la suppression');

      req.body = { id: 1 };

      // findUnique réussit, mais delete échoue
      prisma.produit.findUnique.mockResolvedValue(mockProduitExistant);
      prisma.produit.delete.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await supprimer(req, res);

      // Vérifications
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      expect(prisma.produit.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      expect(consoleSpy).toHaveBeenCalledWith('Erreur:', mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleSpy.mockRestore();
    });

    it('devrait gérer les erreurs Prisma spécifiques', async () => {
      // Simulation d'une erreur Prisma
      const prismaError = {
        code: 'P2025',
        message: 'Record to delete does not exist'
      };
      req.body = { id: 1 };

      prisma.produit.findUnique.mockRejectedValue(prismaError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await supprimer(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('Erreur:', prismaError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Validation des paramètres', () => {
    it('devrait gérer les ID invalides (NaN)', async () => {
      req.body = { id: "abc" };

      // parseInt("abc") retourne NaN
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await supprimer(req, res);

      // Prisma devrait recevoir NaN et probablement échouer
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: NaN }
      });

      consoleSpy.mockRestore();
    });

    it('devrait gérer l\'absence d\'ID dans le body', async () => {
      req.body = {}; // Pas d'ID

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await supprimer(req, res);

      // parseInt(undefined) retourne NaN
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: NaN }
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Vérifications des appels', () => {
    it('ne devrait pas appeler res.status en cas de succès', async () => {
      const mockProduitExistant = { id: 1, nom: 'Test' };
      req.body = { id: 1 };

      prisma.produit.findUnique.mockResolvedValue(mockProduitExistant);
      prisma.produit.delete.mockResolvedValue(mockProduitExistant);

      await supprimer(req, res);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledTimes(1);
    });
  });
});