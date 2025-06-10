const afficherAll = require('../../controllers/produits/afficherAll');
const produitService = require('../../services/produits');

// Mock du service produit au lieu de Prisma directement
jest.mock('../../services/produits', () => ({
  getAllProduits: jest.fn(),
}));

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

      // Configuration du mock du service
      produitService.getAllProduits.mockResolvedValue(mockProduits);

      // Exécution de la fonction
      await afficherAll(req, res);

      // Vérifications
      expect(produitService.getAllProduits).toHaveBeenCalledTimes(1);
      expect(produitService.getAllProduits).toHaveBeenCalledWith();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduits
      });
    });

    it('devrait retourner un tableau vide si aucun produit n\'existe', async () => {
      // Configuration du mock pour un tableau vide
      produitService.getAllProduits.mockResolvedValue([]);

      // Exécution de la fonction
      await afficherAll(req, res);

      // Vérifications
      expect(produitService.getAllProduits).toHaveBeenCalledTimes(1);
      expect(produitService.getAllProduits).toHaveBeenCalledWith();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('Cas d\'erreur', () => {
    it('devrait gérer les erreurs de service', async () => {
      // Configuration du mock pour simuler une erreur
      const mockError = new Error('Erreur de connexion à la base de données');
      produitService.getAllProduits.mockRejectedValue(mockError);

      // Mock de console.error pour éviter l'affichage dans les tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Exécution de la fonction
      await afficherAll(req, res);

      // Vérifications
      expect(produitService.getAllProduits).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Erreur:', mockError);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      // Nettoyage du spy
      consoleSpy.mockRestore();
    });

    it('devrait gérer les erreurs génériques', async () => {
      // Simulation d'une erreur générique
      const genericError = new Error('Erreur inattendue');
      produitService.getAllProduits.mockRejectedValue(genericError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Exécution de la fonction
      await afficherAll(req, res);

      // Vérifications
      expect(consoleSpy).toHaveBeenCalledWith('Erreur:', genericError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Vérifications des appels', () => {
    it('devrait appeler le service avec les bons paramètres', async () => {
      produitService.getAllProduits.mockResolvedValue([]);

      await afficherAll(req, res);

      expect(produitService.getAllProduits).toHaveBeenCalledTimes(1);
      expect(produitService.getAllProduits).toHaveBeenCalledWith();
    });

    it('devrait appeler res.status et res.json en cas de succès', async () => {
      produitService.getAllProduits.mockResolvedValue([]);

      await afficherAll(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
    });
  });
});