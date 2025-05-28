const afficher = require('../../controllers/produits/afficher');
const { PrismaClient } = require('@prisma/client');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    produit: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

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
    prisma.produit.findUnique.mockResolvedValue(mockProduit);

    await afficher(req, res);

    expect(prisma.produit.findUnique).toHaveBeenCalledWith({
      where: { id: '123e4567-e89b-12d3-a456-426614174000' }
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockProduit,
    });
  });

  it('devrait retourner 400 pour un UUID invalide', async () => {
    req.params.uuid = 'invalid-uuid';

    await afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'UUID invalide',
    });
  });

  it('devrait retourner 404 si le produit est introuvable', async () => {
    req.params.uuid = '123e4567-e89b-12d3-a456-426614174000';
    prisma.produit.findUnique.mockResolvedValue(null);

    await afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Produit non trouvé',
    });
  });

  it('devrait retourner 500 en cas d\'erreur serveur', async () => {
    const mockError = new Error('DB error');
    req.params.uuid = '123e4567-e89b-12d3-a456-426614174000';
    prisma.produit.findUnique.mockRejectedValue(mockError);

    await afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });
  });
});
