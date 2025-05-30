const ajouter = require('../../controllers/produits/ajouter');
const { PrismaClient } = require('@prisma/client');

// Mock de Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    produit: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe('ajouter Controller', () => {
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
    it('devrait créer un produit avec tous les champs remplis', async () => {
      // Données d'entrée
      req.body = {
        nom: 'Produit Test',
        description: 'Description du produit test',
        prix: '25.99',
        stock: '10',
        photo_url: 'http://example.com/photo.jpg',
      };

      // Données mockées de retour
      const mockNouveauProduit = {
        id: 1,
        nom: 'Produit Test',
        description: 'Description du produit test',
        prix: 25.99,
        stock: 10,
        photo_url: 'http://example.com/photo.jpg',
        created_at: new Date('2024-01-01')
      };

      // Configuration du mock
      prisma.produit.create.mockResolvedValue(mockNouveauProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Exécution de la fonction
      await ajouter(req, res);

      // Vérifications
      expect(consoleLogSpy).toHaveBeenCalledWith("Ajouter un produit ", req);

      expect(prisma.produit.create).toHaveBeenCalledWith({
        data: {
          nom: 'Produit Test',
          description: 'Description du produit test',
          prix: 25.99,
          stock: 10,
          photo_url: 'http://example.com/photo.jpg'
        }
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNouveauProduit,
        message: 'Produit créé avec succès'
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait créer un produit avec seulement nom et prix', async () => {
      req.body = {
        nom: 'Produit Minimal',
        prix: '15.50',
        photo_url: 'http://example.com/photo.jpg'
      };

      const mockNouveauProduit = {
        id: 2,
        nom: 'Produit Minimal',
        description: null,
        prix: 15.50,
        stock: 0,
        created_at: new Date('2024-01-01')
      };

      prisma.produit.create.mockResolvedValue(mockNouveauProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(prisma.produit.create).toHaveBeenCalledWith({
        data: {
          nom: 'Produit Minimal',
          description: null,
          prix: 15.50,
          stock: 0,
          photo_url: 'http://example.com/photo.jpg'
        }
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNouveauProduit,
        message: 'Produit créé avec succès'
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait gérer description vide et stock par défaut', async () => {
      req.body = {
        nom: 'Produit Sans Description',
        prix: 99.99,
        description: '',
        stock: '', // chaîne vide
        photo_url: 'http://example.com/photo.jpg'
      };

      const mockNouveauProduit = {
        id: 3,
        nom: 'Produit Sans Description',
        description: null,
        prix: 99.99,
        stock: 0,
        photo_url: 'http://example.com/photo.jpg'
      };

      prisma.produit.create.mockResolvedValue(mockNouveauProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(prisma.produit.create).toHaveBeenCalledWith({
        data: {
          nom: 'Produit Sans Description',
          description: null, // '' || null = null
          prix: 99.99,
          stock: 0, // parseInt('') || 0 = 0
          photo_url: 'http://example.com/photo.jpg'
        }
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait convertir correctement les types numériques', async () => {
      req.body = {
        nom: 'Produit Conversion',
        prix: '123.456', // nombre décimal en string
        stock: '25', // entier en string
        photo_url: 'http://example.com/photo.jpg'
      };

      const mockNouveauProduit = {
        id: 4,
        nom: 'Produit Conversion',
        description: null,
        prix: 123.456,
        stock: 25,
        photo_url: 'http://example.com/photo.jpg'
      };

      prisma.produit.create.mockResolvedValue(mockNouveauProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(prisma.produit.create).toHaveBeenCalledWith({
        data: {
          nom: 'Produit Conversion',
          description: null,
          prix: 123.456,
          stock: 25,
          photo_url: 'http://example.com/photo.jpg'
        }
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('Cas de validation des données', () => {
    it('devrait retourner une erreur si le nom est manquant', async () => {
      req.body = {
        prix: '25.99',
        description: 'Test',
      };

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Le nom et le prix sont requis'
      });

      expect(prisma.produit.create).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('devrait retourner une erreur si le prix est manquant', async () => {
      req.body = {
        nom: 'Produit Test',
        description: 'Test'
      };

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Le nom et le prix sont requis'
      });

      expect(prisma.produit.create).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('devrait retourner une erreur si le nom est une chaîne vide', async () => {
      req.body = {
        nom: '',
        prix: '25.99'
      };

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Le nom et le prix sont requis'
      });

      expect(prisma.produit.create).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('devrait accepter un prix de 0 en string', async () => {
      req.body = {
        nom: 'Produit Gratuit',
        prix: '0'
      };

      const mockNouveauProduit = {
        id: 5,
        nom: 'Produit Gratuit',
        description: null,
        prix: 0,
        stock: 0,
        photo_url: null
      };

      prisma.produit.create.mockResolvedValue(mockNouveauProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(prisma.produit.create).toHaveBeenCalledWith({
        data: {
          nom: 'Produit Gratuit',
          description: null,
          prix: 0,
          stock: 0,
          photo_url: null
        }
      });

      expect(res.status).toHaveBeenCalledWith(201);

      consoleLogSpy.mockRestore();
    });
  });

  describe('Cas d\'erreur', () => {
    it('devrait gérer les erreurs de base de données', async () => {
      req.body = {
        nom: 'Produit Test',
        prix: '25.99'
      };

      const mockError = new Error('Erreur de contrainte unique');
      prisma.produit.create.mockRejectedValue(mockError);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await ajouter(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur:', mockError);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('devrait gérer les erreurs Prisma spécifiques (P2002 - contrainte unique)', async () => {
      req.body = {
        nom: 'Produit Existant',
        prix: '15.99'
      };

      const prismaError = {
        code: 'P2002',
        message: 'Unique constraint failed',
        meta: { target: ['nom'] }
      };

      prisma.produit.create.mockRejectedValue(prismaError);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await ajouter(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur:', prismaError);
      expect(res.status).toHaveBeenCalledWith(500);

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Vérifications des appels', () => {
    it('devrait appeler create avec les bons paramètres', async () => {
      req.body = {
        nom: 'Test Appel',
        description: 'Description test',
        prix: '50.00',
        stock: '5'
      };

      const mockProduit = { id: 6, nom: 'Test Appel' };
      prisma.produit.create.mockResolvedValue(mockProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(prisma.produit.create).toHaveBeenCalledTimes(1);
      expect(prisma.produit.create).toHaveBeenCalledWith({
        data: {
          nom: 'Test Appel',
          description: 'Description test',
          prix: 50.00,
          stock: 5,
          photo_url: null
        }
      });

      consoleLogSpy.mockRestore();
    });

    it('ne devrait pas appeler create si la validation échoue', async () => {
      req.body = {
        description: 'Sans nom ni prix'
      };

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(prisma.produit.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);

      consoleLogSpy.mockRestore();
    });
  });

  describe('Gestion des types de données', () => {
    it('devrait gérer les valeurs NaN pour le stock', async () => {
      req.body = {
        nom: 'Produit NaN',
        prix: '15.99',
        stock: 'abc' // parseInt('abc') = NaN
      };

      const mockProduit = {
        id: 7,
        nom: 'Produit NaN',
        prix: 15.99,
        stock: 0
      };

      prisma.produit.create.mockResolvedValue(mockProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(prisma.produit.create).toHaveBeenCalledWith({
        data: {
          nom: 'Produit NaN',
          description: null,
          prix: 15.99,
          stock: 0, // parseInt('abc') || 0 = 0
          photo_url: null
        }
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait gérer les prix décimaux avec plusieurs décimales', async () => {
      req.body = {
        nom: 'Produit Précis',
        prix: '19.999999'
      };

      const mockProduit = {
        id: 8,
        nom: 'Produit Précis',
        prix: 19.999999
      };

      prisma.produit.create.mockResolvedValue(mockProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(prisma.produit.create).toHaveBeenCalledWith({
        data: {
          nom: 'Produit Précis',
          description: null,
          prix: 19.999999,
          stock: 0,
          photo_url: null
        }
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait gérer les stocks négatifs', async () => {
      req.body = {
        nom: 'Produit Négatif',
        prix: '10.00',
        stock: '-5',
        description: null,
        photo_url: null
      };

      const mockProduit = {
        id: 9,
        nom: 'Produit Négatif',
        prix: 10.00,
        stock: -5,
        description: null,
        photo_url: null
      };

      prisma.produit.create.mockResolvedValue(mockProduit);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await ajouter(req, res);

      expect(prisma.produit.create).toHaveBeenCalledWith({
        data: {
          nom: 'Produit Négatif',
          description: null,
          prix: 10.00,
          stock: -5,
          photo_url: null

        }
      });

      consoleLogSpy.mockRestore();
    });
  });
});