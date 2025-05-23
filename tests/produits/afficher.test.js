const afficher = require('../../controllers/produits/afficher');
const { PrismaClient } = require('@prisma/client');

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    produit: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('afficher Controller', () => {
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
    it('devrait retourner un produit existant avec un ID valide', async () => {
      // Données mockées
      const mockProduit = {
        id: 1,
        nom: 'Produit Test',
        prix: 25.99,
        description: 'Description du produit test',
        created_at: new Date('2024-01-01')
      };

      // Configuration de la requête
      req.body.id = '1';

      // Configuration du mock
      prisma.produit.findUnique.mockResolvedValue(mockProduit);

      // Mock de console.log pour éviter l'affichage dans les tests
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Exécution de la fonction
      await afficher(req, res);

      // Vérifications
      expect(consoleLogSpy).toHaveBeenCalledWith("Afficher un produit ", req);
      expect(consoleLogSpy).toHaveBeenCalledWith("ID du produit à afficher:", '1');

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1
        }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduit
      });

      expect(res.status).not.toHaveBeenCalled();

      // Nettoyage du spy
      consoleLogSpy.mockRestore();
    });

    it('devrait gérer un ID numérique direct', async () => {
      const mockProduit = {
        id: 5,
        nom: 'Produit 5',
        prix: 15.00
      };

      // Configuration de la requête avec un nombre
      req.body.id = 5;

      prisma.produit.findUnique.mockResolvedValue(mockProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await afficher(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: {
          id: 5
        }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduit
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait convertir une chaîne numérique en entier', async () => {
      const mockProduit = {
        id: 10,
        nom: 'Produit 10'
      };

      req.body.id = '10';
      prisma.produit.findUnique.mockResolvedValue(mockProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await afficher(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: {
          id: 10
        }
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('Cas de produit non trouvé', () => {
    it('devrait retourner 404 si le produit n\'existe pas', async () => {
      // Configuration de la requête
      req.body.id = '999';

      // Configuration du mock pour retourner null
      prisma.produit.findUnique.mockResolvedValue(null);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Exécution de la fonction
      await afficher(req, res);

      // Vérifications
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: {
          id: 999
        }
      });

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Produit non trouvé'
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait retourner 404 pour un ID qui n\'existe pas en base', async () => {
      req.body.id = '0';
      prisma.produit.findUnique.mockResolvedValue(null);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await afficher(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Produit non trouvé'
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('Cas d\'erreur', () => {
    it('devrait gérer les erreurs de base de données', async () => {
      req.body.id = '1';

      // Configuration du mock pour simuler une erreur
      const mockError = new Error('Erreur de connexion à la base de données');
      prisma.produit.findUnique.mockRejectedValue(mockError);

      // Mock des console pour éviter l'affichage dans les tests
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Exécution de la fonction
      await afficher(req, res);

      // Vérifications
      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur:', mockError);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      // Nettoyage des spies
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('devrait gérer les erreurs de parsing d\'ID invalide', async () => {
      req.body.id = 'abc'; // ID non numérique

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // parseInt('abc') donne NaN, ce qui peut causer des erreurs
      prisma.produit.findUnique.mockRejectedValue(new Error('Invalid ID'));

      await afficher(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('devrait gérer l\'absence d\'ID dans la requête', async () => {
      // req.body.id est undefined
      req.body = {};

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // parseInt(undefined) donne NaN
      prisma.produit.findUnique.mockRejectedValue(new Error('ID manquant'));

      await afficher(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Vérifications des appels', () => {
    it('devrait appeler findUnique avec les bons paramètres', async () => {
      req.body.id = '42';
      prisma.produit.findUnique.mockResolvedValue({ id: 42, nom: 'Test' });

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await afficher(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: {
          id: 42
        }
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait logger les informations correctes', async () => {
      req.body.id = '123';
      prisma.produit.findUnique.mockResolvedValue(null);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await afficher(req, res);

      expect(consoleLogSpy).toHaveBeenCalledWith("Afficher un produit ", req);
      expect(consoleLogSpy).toHaveBeenCalledWith("ID du produit à afficher:", '123');

      consoleLogSpy.mockRestore();
    });
  });

  describe('Gestion des types d\'ID', () => {
    it('devrait gérer un ID de type string avec des espaces', async () => {
      req.body.id = ' 7 ';
      const mockProduit = { id: 7, nom: 'Produit 7' };
      prisma.produit.findUnique.mockResolvedValue(mockProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await afficher(req, res);

      // parseInt(' 7 ') = 7
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: {
          id: 7
        }
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait gérer un ID float (sera tronqué)', async () => {
      req.body.id = '3.14';
      const mockProduit = { id: 3, nom: 'Produit 3' };
      prisma.produit.findUnique.mockResolvedValue(mockProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await afficher(req, res);

      // parseInt('3.14') = 3
      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: {
          id: 3
        }
      });

      consoleLogSpy.mockRestore();
    });
  });
});