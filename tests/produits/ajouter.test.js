const ajouter = require('../../controllers/produits/ajouter');
const produitService = require('../../services/produits');

// Mock du service produit au lieu de Prisma directement
jest.mock('../../services/produits', () => ({
  createProduit: jest.fn(),
}));

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
      produitService.createProduit.mockResolvedValue(mockNouveauProduit);

      // Exécution de la fonction
      await ajouter(req, res);

      // Vérifications
      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNouveauProduit,
        message: 'Produit créé avec succès'
      });
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

      produitService.createProduit.mockResolvedValue(mockNouveauProduit);

      await ajouter(req, res);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNouveauProduit,
        message: 'Produit créé avec succès'
      });
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

      produitService.createProduit.mockResolvedValue(mockNouveauProduit);

      await ajouter(req, res);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
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

      produitService.createProduit.mockResolvedValue(mockNouveauProduit);

      await ajouter(req, res);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
    });
  });

  describe('Cas de validation des données', () => {
    it('devrait retourner une erreur si le nom est manquant', async () => {
      req.body = {
        prix: '25.99',
        description: 'Test',
      };

      // Le service doit lever une erreur de validation
      produitService.createProduit.mockRejectedValue(new Error('Le nom et le prix sont requis'));

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Le nom et le prix sont requis'
      });

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
    });

    it('devrait retourner une erreur si le prix est manquant', async () => {
      req.body = {
        nom: 'Produit Test',
        description: 'Test'
      };

      produitService.createProduit.mockRejectedValue(new Error('Le nom et le prix sont requis'));

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Le nom et le prix sont requis'
      });

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
    });

    it('devrait retourner une erreur si le nom est une chaîne vide', async () => {
      req.body = {
        nom: '',
        prix: '25.99'
      };

      produitService.createProduit.mockRejectedValue(new Error('Le nom et le prix sont requis'));

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Le nom et le prix sont requis'
      });

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
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

      produitService.createProduit.mockResolvedValue(mockNouveauProduit);

      await ajouter(req, res);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Cas d\'erreur', () => {
    it('devrait gérer les erreurs de base de données', async () => {
      req.body = {
        nom: 'Produit Test',
        prix: '25.99'
      };

      const mockError = new Error('Erreur de contrainte unique');
      produitService.createProduit.mockRejectedValue(mockError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await ajouter(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur:', mockError);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur de contrainte unique'
      });

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

      produitService.createProduit.mockRejectedValue(prismaError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await ajouter(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur:', prismaError);
      expect(res.status).toHaveBeenCalledWith(500);

      consoleErrorSpy.mockRestore();
    });

    it('devrait gérer les erreurs sans message spécifique', async () => {
      req.body = {
        nom: 'Produit Test',
        prix: '25.99'
      };

      const errorWithoutMessage = {};
      produitService.createProduit.mockRejectedValue(errorWithoutMessage);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Vérifications des appels', () => {
    it('devrait appeler createProduit avec les bons paramètres', async () => {
      req.body = {
        nom: 'Test Appel',
        description: 'Description test',
        prix: '50.00',
        stock: '5'
      };

      const mockProduit = { id: 6, nom: 'Test Appel' };
      produitService.createProduit.mockResolvedValue(mockProduit);

      await ajouter(req, res);

      expect(produitService.createProduit).toHaveBeenCalledTimes(1);
      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
    });

    it('devrait appeler createProduit même si la validation échoue', async () => {
      req.body = {
        description: 'Sans nom ni prix'
      };

      produitService.createProduit.mockRejectedValue(new Error('Le nom et le prix sont requis'));

      await ajouter(req, res);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Gestion des statuts de réponse', () => {
    it('devrait retourner 400 pour une erreur de validation', async () => {
      req.body = {
        nom: '',
        prix: ''
      };

      produitService.createProduit.mockRejectedValue(new Error('Le nom et le prix sont requis'));

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 500 pour une erreur serveur générique', async () => {
      req.body = {
        nom: 'Produit Test',
        prix: '25.99'
      };

      produitService.createProduit.mockRejectedValue(new Error('Erreur de base de données'));

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('devrait retourner 201 en cas de succès', async () => {
      req.body = {
        nom: 'Produit Succès',
        prix: '15.99'
      };

      const mockProduit = { id: 1, nom: 'Produit Succès' };
      produitService.createProduit.mockResolvedValue(mockProduit);

      await ajouter(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});