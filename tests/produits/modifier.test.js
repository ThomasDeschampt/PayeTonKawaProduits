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
    // Mock des objets req et res
    req = {
      params: {},
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
    it('devrait modifier tous les champs d\'un produit existant', async () => {
      // Configuration de la requête
      req.params.id = '1';
      req.body = {
        nom: 'Produit Modifié',
        description: 'Nouvelle description',
        prix: '35.99',
        stock: '15'
      };

      // Mock du produit existant
      const produitExistant = {
        id: 1,
        nom: 'Ancien Produit',
        description: 'Ancienne description',
        prix: 25.99,
        stock: 10
      };

      // Mock du produit mis à jour
      const produitMisAJour = {
        id: 1,
        nom: 'Produit Modifié',
        description: 'Nouvelle description',
        prix: 35.99,
        stock: 15,
        updated_at: new Date('2024-01-02')
      };

      // Configuration des mocks
      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Exécution de la fonction
      await modifier(req, res);

      // Vérifications
      expect(consoleLogSpy).toHaveBeenCalledWith("Modifier un produit ", req);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          nom: 'Produit Modifié',
          description: 'Nouvelle description',
          prix: 35.99,
          stock: 15
        }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: produitMisAJour,
        message: 'Produit mis à jour avec succès'
      });

      expect(res.status).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('devrait modifier seulement le nom', async () => {
      req.params.id = '2';
      req.body = {
        nom: 'Nouveau Nom'
        // description, prix, stock sont undefined
      };

      const produitExistant = {
        id: 2,
        nom: 'Ancien Nom',
        description: 'Description existante',
        prix: 20.00,
        stock: 5
      };

      const produitMisAJour = {
        ...produitExistant,
        nom: 'Nouveau Nom'
      };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          nom: 'Nouveau Nom'
          // Seulement le nom dans dataToUpdate
        }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: produitMisAJour,
        message: 'Produit mis à jour avec succès'
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait modifier seulement le prix', async () => {
      req.params.id = '3';
      req.body = {
        prix: '99.99'
      };

      const produitExistant = { id: 3, nom: 'Produit', prix: 50.00 };
      const produitMisAJour = { ...produitExistant, prix: 99.99 };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: {
          prix: 99.99
        }
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait gérer les valeurs null et empty string', async () => {
      req.params.id = '4';
      req.body = {
        description: null,
        stock: ''
      };

      const produitExistant = { id: 4, nom: 'Produit', description: 'Ancienne desc', stock: 10 };
      const produitMisAJour = { ...produitExistant, description: null};

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 4 },
        data: {
          description: null
        }
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait convertir correctement les types numériques', async () => {
      req.params.id = '5';
      req.body = {
        prix: '123.456',
        stock: '25'
      };

      const produitExistant = { id: 5, nom: 'Produit', prix: 100, stock: 20 };
      const produitMisAJour = { ...produitExistant, prix: 123.456, stock: 25 };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          prix: 123.456,
          stock: 25
        }
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('Cas de produit non trouvé', () => {
    it('devrait retourner 404 si le produit n\'existe pas', async () => {
      req.params.id = '999';
      req.body = {
        nom: 'Nouveau Nom'
      };

      // Mock de findUnique retournant null
      prisma.produit.findUnique.mockResolvedValue(null);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Produit non trouvé'
      });

      // Ne devrait pas appeler update
      expect(prisma.produit.update).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('devrait retourner 404 pour un ID invalide', async () => {
      req.params.id = 'abc';
      req.body = { nom: 'Test' };

      // parseInt('abc') = NaN, peut causer des erreurs ou retourner null
      prisma.produit.findUnique.mockResolvedValue(null);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(prisma.produit.update).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });
  });

  describe('Cas d\'erreur', () => {
    it('devrait gérer les erreurs lors de la recherche du produit', async () => {
      req.params.id = '1';
      req.body = { nom: 'Test' };

      const mockError = new Error('Erreur de connexion à la base de données');
      prisma.produit.findUnique.mockRejectedValue(mockError);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await modifier(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur:', mockError);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      expect(prisma.produit.update).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('devrait gérer les erreurs lors de la mise à jour', async () => {
      req.params.id = '1';
      req.body = { nom: 'Test' };

      const produitExistant = { id: 1, nom: 'Ancien' };
      const updateError = new Error('Erreur lors de la mise à jour');

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockRejectedValue(updateError);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await modifier(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur:', updateError);
      expect(res.status).toHaveBeenCalledWith(500);

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('devrait gérer les erreurs Prisma spécifiques (P2025 - Record not found)', async () => {
      req.params.id = '1';
      req.body = { nom: 'Test' };

      const produitExistant = { id: 1, nom: 'Ancien' };
      const prismaError = {
        code: 'P2025',
        message: 'Record to update not found'
      };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockRejectedValue(prismaError);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await modifier(req, res);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur:', prismaError);
      expect(res.status).toHaveBeenCalledWith(500);

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cas de modification vide', () => {
    it('devrait gérer une requête sans aucun champ à modifier', async () => {
      req.params.id = '1';
      req.body = {}; // Aucun champ à modifier

      const produitExistant = { id: 1, nom: 'Produit', prix: 10.00 };
      const produitMisAJour = { ...produitExistant };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      // dataToUpdate devrait être un objet vide
      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {}
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: produitMisAJour,
        message: 'Produit mis à jour avec succès'
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait ignorer les champs undefined et traiter les champs null', async () => {
      req.params.id = '2';
      req.body = {
        nom: 'Nouveau Nom',
        description: null, // Explicitement null
        prix: undefined,   // undefined - ne devrait pas être inclus
        stock: 0          // 0 devrait être inclus
      };

      const produitExistant = { id: 2, nom: 'Ancien', description: 'Desc', prix: 10, stock: 5 };
      const produitMisAJour = { ...produitExistant, nom: 'Nouveau Nom', description: null, stock: 0 };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          nom: 'Nouveau Nom',
          description: null,
          stock: 0
          // prix ne devrait pas être inclus car undefined
        }
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('Vérifications des appels', () => {

    it('devrait parser l\'ID correctement pour les deux appels Prisma', async () => {
      req.params.id = '42';
      req.body = { nom: 'Test' };

      const produitExistant = { id: 42, nom: 'Ancien' };
      const produitMisAJour = { ...produitExistant, nom: 'Test' };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(prisma.produit.findUnique).toHaveBeenCalledWith({
        where: { id: 42 }
      });

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 42 },
        data: { nom: 'Test' }
      });

      consoleLogSpy.mockRestore();
    });
  });

  describe('Gestion des types de données', () => {
    it('devrait ignorer les valeurs NaN pour stock et prix', async () => {
      req.params.id = '1';
      req.body = {
        prix: 'abc',  // parseFloat('abc') = NaN
        stock: 'def'  // parseInt('def') = NaN
      };

      const produitExistant = { id: 1, nom: 'Produit' };
      const produitMisAJour = { ...produitExistant};

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {}
      });

      consoleLogSpy.mockRestore();
    });

    it('devrait gérer les stocks et prix négatifs', async () => {
      req.params.id = '1';
      req.body = {
        prix: '-10.50',
        stock: '-5'
      };

      const produitExistant = { id: 1, nom: 'Produit' };
      const produitMisAJour = { ...produitExistant, prix: -10.50, stock: -5 };

      prisma.produit.findUnique.mockResolvedValue(produitExistant);
      prisma.produit.update.mockResolvedValue(produitMisAJour);

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await modifier(req, res);

      expect(prisma.produit.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          prix: -10.50,
          stock: -5
        }
      });

      consoleLogSpy.mockRestore();
    });
  });
});