const ajouter = require('../../controllers/produits/ajouter');
const produitService = require('../../services/produits');
const rabbitmq = require('../../services/rabbitmqService');

// Mock des services
jest.mock('../../services/produits', () => ({
  createProduit: jest.fn(),
}));

jest.mock('../../services/rabbitmqService', () => ({
  publishProductCreated: jest.fn(),
}));

describe('ajouter Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Cas de succès', () => {
    it('devrait créer un produit avec tous les champs remplis', async () => {
      req.body = {
        nom: 'Produit Test',
        description: 'Description du produit test',
        prix: '25.99',
        stock: '10',
        photo_url: 'http://example.com/photo.jpg',
      };

      const mockNouveauProduit = {
        id: 1,
        nom: 'Produit Test',
        description: 'Description du produit test',
        prix: 25.99,
        stock: 10,
        photo_url: 'http://example.com/photo.jpg',
        created_at: new Date('2024-01-01')
      };

      produitService.createProduit.mockResolvedValue(mockNouveauProduit);

      await ajouter(req, res, next);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
      expect(rabbitmq.publishProductCreated).toHaveBeenCalledWith(mockNouveauProduit);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNouveauProduit,
        message: 'Produit créé avec succès'
      });
      expect(next).not.toHaveBeenCalled();
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
        photo_url: 'http://example.com/photo.jpg',
        created_at: new Date('2024-01-01')
      };

      produitService.createProduit.mockResolvedValue(mockNouveauProduit);

      await ajouter(req, res, next);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
      expect(rabbitmq.publishProductCreated).toHaveBeenCalledWith(mockNouveauProduit);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockNouveauProduit,
        message: 'Produit créé avec succès'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait gérer description vide et stock par défaut', async () => {
      req.body = {
        nom: 'Produit Sans Description',
        prix: 99.99,
        description: '',
        stock: '',
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

      await ajouter(req, res, next);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
      expect(rabbitmq.publishProductCreated).toHaveBeenCalledWith(mockNouveauProduit);
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait convertir correctement les types numériques', async () => {
      req.body = {
        nom: 'Produit Conversion',
        prix: '123.456',
        stock: '25',
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

      await ajouter(req, res, next);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
      expect(rabbitmq.publishProductCreated).toHaveBeenCalledWith(mockNouveauProduit);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Cas de validation des données', () => {
    it('devrait retourner une erreur si le nom est manquant', async () => {
      req.body = {
        prix: '25.99',
        description: 'Test',
      };

      const error = new Error('Le nom et le prix sont requis');
      produitService.createProduit.mockRejectedValue(error);

      await ajouter(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('devrait retourner une erreur si le prix est manquant', async () => {
      req.body = {
        nom: 'Produit Test',
        description: 'Test'
      };

      const error = new Error('Le nom et le prix sont requis');
      produitService.createProduit.mockRejectedValue(error);

      await ajouter(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('devrait retourner une erreur si le nom est une chaîne vide', async () => {
      req.body = {
        nom: '',
        prix: '25.99'
      };

      const error = new Error('Le nom et le prix sont requis');
      produitService.createProduit.mockRejectedValue(error);

      await ajouter(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
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

      await ajouter(req, res, next);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
      expect(rabbitmq.publishProductCreated).toHaveBeenCalledWith(mockNouveauProduit);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Cas d\'erreur', () => {
    it('devrait gérer les erreurs de base de données', async () => {
      req.body = {
        nom: 'Produit Test',
        prix: '25.99'
      };

      const error = new Error('Erreur de base de données');
      produitService.createProduit.mockRejectedValue(error);

      await ajouter(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('devrait gérer les erreurs Prisma spécifiques', async () => {
      req.body = {
        nom: 'Produit Existant',
        prix: '15.99'
      };

      const error = new Error('Un produit avec ce nom existe déjà');
      produitService.createProduit.mockRejectedValue(error);

      await ajouter(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('devrait gérer les erreurs sans message spécifique', async () => {
      req.body = {
        nom: 'Produit Test',
        prix: '25.99'
      };

      const error = new Error('Erreur serveur');
      produitService.createProduit.mockRejectedValue(error);

      await ajouter(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
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

      await ajouter(req, res, next);

      expect(produitService.createProduit).toHaveBeenCalledTimes(1);
      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
      expect(rabbitmq.publishProductCreated).toHaveBeenCalledWith(mockProduit);
    });

    it('devrait appeler createProduit même si la validation échoue', async () => {
      req.body = {
        description: 'Sans nom ni prix'
      };

      const error = new Error('Le nom et le prix sont requis');
      produitService.createProduit.mockRejectedValue(error);

      await ajouter(req, res, next);

      expect(produitService.createProduit).toHaveBeenCalledWith(req.body);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Gestion des statuts de réponse', () => {
    it('devrait retourner 400 pour une erreur de validation', async () => {
      req.body = {
        nom: '',
        prix: ''
      };

      const error = new Error('Le nom et le prix sont requis');
      produitService.createProduit.mockRejectedValue(error);

      await ajouter(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('devrait retourner 500 pour une erreur serveur générique', async () => {
      req.body = {
        nom: 'Produit Test',
        prix: '25.99'
      };

      const error = new Error('Erreur de base de données');
      produitService.createProduit.mockRejectedValue(error);

      await ajouter(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('devrait retourner 201 en cas de succès', async () => {
      req.body = {
        nom: 'Produit Succès',
        prix: '15.99'
      };

      const mockProduit = { id: 1, nom: 'Produit Succès' };
      produitService.createProduit.mockResolvedValue(mockProduit);

      await ajouter(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduit,
        message: 'Produit créé avec succès'
      });
    });
  });
});
