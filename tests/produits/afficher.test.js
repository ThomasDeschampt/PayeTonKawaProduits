const afficher = require('../../controllers/produits/afficher');
const produitService = require('../../services/produits');

// Mock du service produit au lieu de Prisma directement
jest.mock('../../services/produits', () => ({
  getProduit: jest.fn(),
}));

describe('afficher Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  it('devrait retourner un produit existant avec un UUID valide', async () => {
    const mockProduit = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nom: 'Produit Test',
      prix: 25.99,
    };

    req.params.uuid = '123e4567-e89b-12d3-a456-426614174000';
    produitService.getProduit.mockResolvedValue(mockProduit);

    await afficher(req, res);

    expect(produitService.getProduit).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockProduit,
    });
  });

  it('devrait retourner 404 si le produit est introuvable', async () => {
    req.params.uuid = '123e4567-e89b-12d3-a456-426614174000';
    produitService.getProduit.mockResolvedValue(null);

    await afficher(req, res);

    expect(produitService.getProduit).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Produit non trouvé',
    });
  });

  it('devrait retourner 500 en cas d\'erreur serveur', async () => {
    const mockError = new Error('DB error');
    req.params.uuid = '123e4567-e89b-12d3-a456-426614174000';
    produitService.getProduit.mockRejectedValue(mockError);

    // Mock de console.error pour éviter l'affichage dans les tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await afficher(req, res);

    expect(produitService.getProduit).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    expect(consoleSpy).toHaveBeenCalledWith('Erreur:', mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });

    // Nettoyage du spy
    consoleSpy.mockRestore();
  });

  it('devrait appeler le service avec le bon UUID', async () => {
    const testUuid = 'test-uuid-123';
    req.params.uuid = testUuid;
    produitService.getProduit.mockResolvedValue({ id: testUuid, nom: 'Test' });

    await afficher(req, res);

    expect(produitService.getProduit).toHaveBeenCalledTimes(1);
    expect(produitService.getProduit).toHaveBeenCalledWith(testUuid);
  });

  it('devrait gérer les UUIDs vides ou undefined', async () => {
    req.params.uuid = undefined;
    produitService.getProduit.mockResolvedValue(null);

    await afficher(req, res);

    expect(produitService.getProduit).toHaveBeenCalledWith(undefined);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Produit non trouvé',
    });
  });
});