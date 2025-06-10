const afficher = require('../../controllers/produits/afficher');
const produitService = require('../../services/produits');

// Mock du service produit au lieu de Prisma directement
jest.mock('../../services/produits', () => ({
  getProduit: jest.fn(),
}));

describe('afficher Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

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

    await afficher(req, res, next);

    expect(produitService.getProduit).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    expect(next).toHaveBeenCalledWith(mockError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
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
    req.params = {};

    const error = new Error('UUID manquant');
    produitService.getProduit.mockRejectedValue(error);

    await afficher(req, res, next);

    expect(produitService.getProduit).toHaveBeenCalledWith(undefined);
    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});