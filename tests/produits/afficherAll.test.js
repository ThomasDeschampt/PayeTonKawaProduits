const afficherAll = require('../../controllers/produits/afficherAll');
const { PrismaClient } = require('@prisma/client');

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    produit: {  // Correction: "produit" au lieu de "produits"
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('afficherAll Controller', () => {
  let req, res;

  beforeEach(() => {
    // Mock des objets req et res
    req = {};
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
    it('devrait retourner tous les produits avec succès', async () => {
      // Données mockées
      const mockProduits = [
        {
          id: 1,
          nom: 'Produit 1',
          prix: 10.99,
          created_at: new Date('2024-01-02')
        },
        {
          id: 2,
          nom: 'Produit 2',
          prix: 15.50,
          created_at: new Date('2024-01-01')
        }
      ];

      // Configuration du mock
      prisma.produit.findMany.mockResolvedValue(mockProduits);

      // Exécution de la fonction
      await afficherAll(req, res);

      // Vérifications
      expect(prisma.produit.findMany).toHaveBeenCalledWith({
        orderBy: {
          created_at: 'desc'
        }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduits,
        count: mockProduits.length
      });

      expect(res.status).not.toHaveBeenCalled();
    });

    it('devrait retourner un tableau vide si aucun produit n\'existe', async () => {
      // Configuration du mock pour un tableau vide
      prisma.produit.findMany.mockResolvedValue([]);

      // Exécution de la fonction
      await afficherAll(req, res);

      // Vérifications
      expect(prisma.produit.findMany).toHaveBeenCalledWith({
        orderBy: {
          created_at: 'desc'
        }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0
      });
    });
  });

  describe('Cas d\'erreur', () => {
    it('devrait gérer les erreurs de base de données', async () => {
      // Configuration du mock pour simuler une erreur
      const mockError = new Error('Erreur de connexion à la base de données');
      prisma.produit.findMany.mockRejectedValue(mockError);

      // Mock de console.error pour éviter l'affichage dans les tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Exécution de la fonction
      await afficherAll(req, res);

      // Vérifications
      expect(prisma.produit.findMany).toHaveBeenCalledWith({
        orderBy: {
          created_at: 'desc'
        }
      });

      expect(consoleSpy).toHaveBeenCalledWith('Erreur:', mockError);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      // Nettoyage du spy
      consoleSpy.mockRestore();
    });

    it('devrait gérer les erreurs Prisma spécifiques', async () => {
      // Simulation d'une erreur Prisma
      const prismaError = {
        code: 'P2002',
        message: 'Erreur Prisma spécifique'
      };
      prisma.produit.findMany.mockRejectedValue(prismaError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Exécution de la fonction
      await afficherAll(req, res);

      // Vérifications
      expect(consoleSpy).toHaveBeenCalledWith('Erreur:', prismaError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Vérifications des appels', () => {
    it('devrait appeler findMany avec les bons paramètres', async () => {
      prisma.produit.findMany.mockResolvedValue([]);

      await afficherAll(req, res);

      expect(prisma.produit.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.produit.findMany).toHaveBeenCalledWith({
        orderBy: {
          created_at: 'desc'
        }
      });
    });

    it('ne devrait pas appeler res.status en cas de succès', async () => {
      prisma.produit.findMany.mockResolvedValue([]);

      await afficherAll(req, res);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledTimes(1);
    });
  });
});