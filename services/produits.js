const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProduitService {
  async createProduit(produitData) {
    const { nom, description, prix, stock, photo_url } = produitData;

    if (!nom || prix === undefined) {
      throw new Error('Le nom et le prix sont requis');
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

  async getProduit(id) {
    return await prisma.produit.findUnique({
      where: { id: parseInt(id) }
    });
  }

  async getAllProduits() {
    return await prisma.produit.findMany();
  }

  async updateProduit(id, produitData) {
    const { nom, description, prix, stock, photo_url } = produitData;

    return await prisma.produit.update({
      where: { id: parseInt(id) },
      data: {
        nom,
        description,
        prix: prix ? parseFloat(prix) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        photo_url
      }
    });
  }

  async deleteProduit(id) {
    return await prisma.produit.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new ProduitService(); 