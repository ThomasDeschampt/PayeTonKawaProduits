const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher un produit par id
const afficher = async (req, res) => {
    try {
        const { uuid } = req.params;
        

        const produit = await prisma.produit.findUnique({
            where: {
                id: uuid
            }
        });

        if (!produit) {
            return res.status(404).json({
                success: false,
                message: 'Produit non trouvé'
            });
        }

        res.json({
            success: true,
            data: produit
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
}

module.exports = afficher;