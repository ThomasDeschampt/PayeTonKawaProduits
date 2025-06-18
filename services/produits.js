const { PrismaClient } = require("@prisma/client");
const { ValidationError, NotFoundError } = require('../utils/errors');
const prisma = new PrismaClient();

class ProduitService {
  async createProduit(produitData) {
    const { nom, description, prix, stock, photo_url } = produitData;

    if (!nom || prix === undefined) {
      throw new ValidationError('Le nom et le prix sont requis');
    }

    return await prisma.produit.create({
      data: {
        nom,
        description: description || null,
        prix: parseFloat(prix),
        stock: parseInt(stock) || 0,
        photo_url: photo_url || null
      }
    });
  }

  async getProduit(uuid) {
    const produit = await prisma.produit.findUnique({
      where: { id: uuid }
    });

    if (!produit) {
      throw new NotFoundError('Produit non trouvé');
    }

    return produit;
  }

  async getAllProduits() {
    return await prisma.produit.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
  }

async updateProduit(uuid, produitData) {
  const produit = await prisma.produit.findUnique({
    where: { id: uuid }
  });

  if (!produit) {
    throw new NotFoundError('Produit non trouvé');
  }

  const { nom, description, prix, stock, photo_url } = produitData;

  return await prisma.produit.update({
    where: { id: uuid },
    data: {
      nom,
      description,
      prix: prix !== undefined ? parseFloat(prix) : undefined,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      photo_url
    }
  });
}


  async deleteProduit(uuid) {
    const produit = await prisma.produit.findUnique({
      where: { id: uuid }
    });

    if (!produit) {
      throw new NotFoundError('Produit non trouvé');
    }

    return await prisma.produit.delete({
      where: { id: uuid }
    });
  }

  async reduireStock(uuid, quantite) {
    const produit = await prisma.produit.findUnique({
      where: { id: uuid }
    });

    if (!produit) {
      throw new NotFoundError('Produit non trouvé');
    }

    if (produit.stock < quantite) {
      throw new ValidationError('Stock insuffisant');
    }

    return await prisma.produit.update({
      where: { id: uuid },
      data: {
        stock: produit.stock - quantite
      }
    });
  }
}

module.exports = new ProduitService(); 